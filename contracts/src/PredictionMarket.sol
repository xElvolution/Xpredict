// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title XPredict Binary Prediction Market
/// @notice One contract = one Yes/No question. Mint/redeem outcome shares against USDC,
///         trade them via a constant-product AMM, claim after resolver settles.
/// @dev    Outcome 0 = YES, Outcome 1 = NO. Collateral is denominated in `collateral.decimals()`.
contract PredictionMarket {
    /* --------------------------------------------------------- */
    /*  Events                                                   */
    /* --------------------------------------------------------- */
    event LiquidityAdded(address indexed lp, uint256 collateralIn, uint256 lpSharesOut);
    event LiquidityRemoved(address indexed lp, uint256 lpSharesIn, uint256 collateralOut);
    event Bought(address indexed buyer, uint8 outcome, uint256 collateralIn, uint256 sharesOut);
    event Sold(address indexed seller, uint8 outcome, uint256 sharesIn, uint256 collateralOut);
    event Resolved(uint8 winningOutcome, address resolver);
    event Finalized();
    event Claimed(address indexed account, uint256 payout);

    /* --------------------------------------------------------- */
    /*  Errors                                                   */
    /* --------------------------------------------------------- */
    error NotResolver();
    error NotFactory();
    error AlreadyResolved();
    error NotResolved();
    error AlreadyFinalized();
    error NotFinalized();
    error MarketClosed();
    error MarketOpen();
    error InvalidOutcome();
    error InsufficientOutput();
    error InsufficientLiquidity();
    error ZeroAmount();
    error InDisputeWindow();

    /* --------------------------------------------------------- */
    /*  Storage                                                  */
    /* --------------------------------------------------------- */
    IERC20  public immutable collateral;       // USDC
    address public immutable factory;
    address public immutable resolver;         // resolver agent address
    address public immutable treasury;
    string  public           question;
    uint256 public immutable closesAt;
    uint256 public immutable disputeWindow;    // seconds between resolve() and finalize()
    uint16  public immutable feeBps;           // protocol fee, 100 = 1%

    // AMM state
    uint256 public yesReserves;
    uint256 public noReserves;
    uint256 public totalLpShares;
    mapping(address => uint256) public lpBalanceOf;

    // Outcome share ledger (1 share = 1 collateral if winning)
    mapping(uint8 => mapping(address => uint256)) public sharesOf;
    mapping(uint8 => uint256) public sharesSupply;

    // Resolution
    bool    public resolved;
    bool    public finalized;
    uint8   public winningOutcome;
    uint256 public resolvedAt;

    /* --------------------------------------------------------- */
    /*  Constructor                                              */
    /* --------------------------------------------------------- */
    constructor(
        address _collateral,
        address _resolver,
        address _treasury,
        string memory _question,
        uint256 _closesAt,
        uint256 _disputeWindow,
        uint16  _feeBps
    ) {
        require(_collateral != address(0) && _resolver != address(0) && _treasury != address(0), "zero addr");
        require(_closesAt > block.timestamp, "closes in past");
        require(_feeBps <= 500, "fee too high"); // hard cap 5%

        factory       = msg.sender;
        collateral    = IERC20(_collateral);
        resolver      = _resolver;
        treasury      = _treasury;
        question      = _question;
        closesAt      = _closesAt;
        disputeWindow = _disputeWindow;
        feeBps        = _feeBps;
    }

    /* --------------------------------------------------------- */
    /*  Mint / merge (1 USDC -> 1 YES + 1 NO)                    */
    /* --------------------------------------------------------- */

    /// @notice Pull `amount` USDC and mint `amount` YES + `amount` NO to msg.sender.
    function mintSet(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (block.timestamp >= closesAt) revert MarketClosed();
        _pull(msg.sender, amount);
        _mintShares(0, msg.sender, amount);
        _mintShares(1, msg.sender, amount);
    }

    /// @notice Burn `amount` YES + `amount` NO, refund `amount` USDC.
    function burnSet(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (resolved)    revert AlreadyResolved();
        _burnShares(0, msg.sender, amount);
        _burnShares(1, msg.sender, amount);
        _push(msg.sender, amount);
    }

    /* --------------------------------------------------------- */
    /*  Liquidity                                                */
    /* --------------------------------------------------------- */

    /// @notice Seed initial AMM liquidity 1:1 (only callable while empty).
    function seedLiquidity(uint256 amount) external returns (uint256 lpOut) {
        if (amount == 0) revert ZeroAmount();
        if (totalLpShares != 0) revert InsufficientLiquidity();
        if (block.timestamp >= closesAt) revert MarketClosed();

        _pull(msg.sender, amount);
        _mintShares(0, address(this), amount);
        _mintShares(1, address(this), amount);

        yesReserves = amount;
        noReserves  = amount;
        lpOut       = amount;
        totalLpShares = lpOut;
        lpBalanceOf[msg.sender] = lpOut;

        emit LiquidityAdded(msg.sender, amount, lpOut);
    }

    /* --------------------------------------------------------- */
    /*  Trade — CPMM x*y=k                                       */
    /* --------------------------------------------------------- */

    /// @notice Buy `outcome` shares using `collateralIn` USDC.
    /// @return sharesOut shares received (after fee)
    function buy(uint8 outcome, uint256 collateralIn, uint256 minSharesOut) external returns (uint256 sharesOut) {
        if (outcome > 1) revert InvalidOutcome();
        if (collateralIn == 0) revert ZeroAmount();
        if (block.timestamp >= closesAt) revert MarketClosed();
        if (resolved) revert AlreadyResolved();
        if (yesReserves == 0 || noReserves == 0) revert InsufficientLiquidity();

        _pull(msg.sender, collateralIn);

        // Mint a complete set; one side stays in reserves, the other side flows out.
        _mintShares(0, address(this), collateralIn);
        _mintShares(1, address(this), collateralIn);

        // x*y = k swap: trade the "other" outcome we just minted for the chosen one
        (uint256 reserveIn, uint256 reserveOut) = outcome == 0
            ? (noReserves, yesReserves)        // user wants YES, pay with NO side
            : (yesReserves, noReserves);

        // amountIn is the side we are dumping back into the pool
        uint256 amountIn = collateralIn;
        uint256 amountInAfterFee = amountIn * (10_000 - feeBps) / 10_000;

        uint256 newReserveIn  = reserveIn + amountInAfterFee + collateralIn - amountIn; // == reserveIn + amountInAfterFee
        // x*y = k  =>  newReserveOut = k / newReserveIn
        uint256 k = reserveIn * reserveOut;
        uint256 newReserveOut = k / (reserveIn + amountInAfterFee);

        uint256 takenOut = reserveOut - newReserveOut;     // shares of `outcome` removed from pool
        sharesOut = collateralIn + takenOut;               // user keeps the minted ones + AMM payout

        if (sharesOut < minSharesOut) revert InsufficientOutput();

        // Persist reserves
        if (outcome == 0) {
            yesReserves = newReserveOut;
            noReserves  = reserveIn + amountIn;
        } else {
            noReserves  = newReserveOut;
            yesReserves = reserveIn + amountIn;
        }

        // Move shares: pool keeps the "other" side fully; user gets requested outcome
        _transferShares(outcome,        address(this), msg.sender, sharesOut);
        // The losing side stays in the pool (already minted to address(this)).
        // Fee accrues to LPs as pool reserve growth (standard Uniswap V2 LP fee model).

        emit Bought(msg.sender, outcome, collateralIn, sharesOut);
    }

    /// @notice Sell `sharesIn` shares of `outcome` back for USDC.
    function sell(uint8 outcome, uint256 sharesIn, uint256 minCollateralOut)
        external
        returns (uint256 collateralOut)
    {
        if (outcome > 1) revert InvalidOutcome();
        if (sharesIn == 0) revert ZeroAmount();
        if (block.timestamp >= closesAt) revert MarketClosed();
        if (resolved) revert AlreadyResolved();
        if (yesReserves == 0 || noReserves == 0) revert InsufficientLiquidity();

        // Transfer user's shares into the pool, then redeem complete sets out of pool side
        _transferShares(outcome, msg.sender, address(this), sharesIn);

        (uint256 reserveOther, uint256 reserveSame) = outcome == 0
            ? (noReserves, yesReserves)
            : (yesReserves, noReserves);

        // Apply fee on shares going into the pool
        uint256 sharesAfterFee = sharesIn * (10_000 - feeBps) / 10_000;

        uint256 k = reserveOther * reserveSame;
        uint256 newReserveSame  = reserveSame + sharesAfterFee;
        uint256 newReserveOther = k / newReserveSame;

        uint256 sharesOtherOut = reserveOther - newReserveOther;

        // After we receive `sharesOtherOut` of the other outcome, we now hold matched sets
        // up to min(newReserveSame - reserveSame ... ); simpler: collateralOut = sharesOtherOut
        // because: AMM pays out shares of the other side, which (combined with what we just
        // dumped in) lets us burn complete sets equal to sharesOtherOut.
        collateralOut = sharesOtherOut;

        if (collateralOut < minCollateralOut) revert InsufficientOutput();

        // Persist reserves
        if (outcome == 0) {
            yesReserves = newReserveSame;
            noReserves  = newReserveOther;
        } else {
            noReserves  = newReserveSame;
            yesReserves = newReserveOther;
        }

        // Burn matched set from pool
        _burnShares(0, address(this), collateralOut);
        _burnShares(1, address(this), collateralOut);

        // Pay out
        _push(msg.sender, collateralOut);

        // Fee on shares stays in the pool as reserve growth (Uniswap V2 LP-fee model).
        // We do NOT burn fee shares — that would create an asset/liability mismatch where
        // total collateral > total shares supply, leaving collateral stranded.

        emit Sold(msg.sender, outcome, sharesIn, collateralOut);
    }

    /* --------------------------------------------------------- */
    /*  Pricing                                                  */
    /* --------------------------------------------------------- */

    /// @notice Spot price of YES in 1e18 fixed-point [0, 1e18].
    function priceYes() external view returns (uint256) {
        uint256 total = yesReserves + noReserves;
        if (total == 0) return 0;
        return (noReserves * 1e18) / total;
    }

    /// @notice Spot price of NO in 1e18 fixed-point.
    function priceNo() external view returns (uint256) {
        uint256 total = yesReserves + noReserves;
        if (total == 0) return 0;
        return (yesReserves * 1e18) / total;
    }

    /* --------------------------------------------------------- */
    /*  Resolution                                               */
    /* --------------------------------------------------------- */

    function resolve(uint8 outcome) external {
        if (msg.sender != resolver) revert NotResolver();
        if (outcome > 1)            revert InvalidOutcome();
        if (resolved)               revert AlreadyResolved();
        if (block.timestamp < closesAt) revert MarketOpen();

        winningOutcome = outcome;
        resolved       = true;
        resolvedAt     = block.timestamp;

        emit Resolved(outcome, msg.sender);
    }

    function finalize() external {
        if (!resolved) revert NotResolved();
        if (finalized) revert AlreadyFinalized();
        if (block.timestamp < resolvedAt + disputeWindow) revert InDisputeWindow();
        finalized = true;
        emit Finalized();
    }

    /// @notice Burn winning shares 1:1 for USDC. Losing shares stay worthless.
    function claim() external returns (uint256 payout) {
        if (!finalized) revert NotFinalized();
        uint256 winning = sharesOf[winningOutcome][msg.sender];
        if (winning == 0) revert ZeroAmount();
        _burnShares(winningOutcome, msg.sender, winning);
        payout = winning;
        _push(msg.sender, payout);
        emit Claimed(msg.sender, payout);
    }

    /* --------------------------------------------------------- */
    /*  Internal share ledger                                    */
    /* --------------------------------------------------------- */
    function _mintShares(uint8 outcome, address to, uint256 amount) internal {
        sharesOf[outcome][to]    += amount;
        sharesSupply[outcome]    += amount;
    }

    function _burnShares(uint8 outcome, address from, uint256 amount) internal {
        uint256 bal = sharesOf[outcome][from];
        require(bal >= amount, "insufficient shares");
        unchecked {
            sharesOf[outcome][from] = bal - amount;
            sharesSupply[outcome] -= amount;
        }
    }

    function _transferShares(uint8 outcome, address from, address to, uint256 amount) internal {
        uint256 bal = sharesOf[outcome][from];
        require(bal >= amount, "insufficient shares");
        unchecked { sharesOf[outcome][from] = bal - amount; }
        sharesOf[outcome][to] += amount;
    }

    function _pull(address from, uint256 amount) internal {
        require(collateral.transferFrom(from, address(this), amount), "pull failed");
    }

    function _push(address to, uint256 amount) internal {
        require(collateral.transfer(to, amount), "push failed");
    }
}
