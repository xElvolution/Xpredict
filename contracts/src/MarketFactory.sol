// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PredictionMarket} from "./PredictionMarket.sol";

/// @title XPredict Market Factory
/// @notice Deploys binary prediction markets. Only whitelisted curator agents may create.
contract MarketFactory {
    event MarketCreated(
        address indexed market,
        address indexed curator,
        string  question,
        uint256 closesAt
    );
    event CuratorSet(address indexed curator, bool allowed);
    event ResolverSet(address indexed resolver, bool allowed);
    event ProtocolParamsSet(uint16 feeBps, uint256 disputeWindow);
    event AdminTransferred(address indexed previous, address indexed next);

    error NotAdmin();
    error NotCurator();
    error UnknownResolver();

    address public admin;
    address public immutable collateral;   // USDC
    address public           treasury;

    uint16  public feeBps;                 // protocol fee, 100 = 1%
    uint256 public disputeWindow;          // seconds

    mapping(address => bool) public curators;
    mapping(address => bool) public resolvers;
    address[] public markets;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor(address _collateral, address _treasury) {
        require(_collateral != address(0) && _treasury != address(0), "zero addr");
        admin         = msg.sender;
        collateral    = _collateral;
        treasury      = _treasury;
        feeBps        = 100;          // 1%
        disputeWindow = 1 hours;
    }

    /* --------------------------------------------------------- */
    /*  Admin                                                    */
    /* --------------------------------------------------------- */
    function setCurator(address curator, bool allowed) external onlyAdmin {
        curators[curator] = allowed;
        emit CuratorSet(curator, allowed);
    }

    function setResolver(address resolver, bool allowed) external onlyAdmin {
        resolvers[resolver] = allowed;
        emit ResolverSet(resolver, allowed);
    }

    function setProtocolParams(uint16 _feeBps, uint256 _disputeWindow) external onlyAdmin {
        require(_feeBps <= 500, "fee too high");
        feeBps = _feeBps;
        disputeWindow = _disputeWindow;
        emit ProtocolParamsSet(_feeBps, _disputeWindow);
    }

    function setTreasury(address _treasury) external onlyAdmin {
        require(_treasury != address(0), "zero addr");
        treasury = _treasury;
    }

    function transferAdmin(address next) external onlyAdmin {
        require(next != address(0), "zero addr");
        emit AdminTransferred(admin, next);
        admin = next;
    }

    /* --------------------------------------------------------- */
    /*  Create                                                   */
    /* --------------------------------------------------------- */
    function createMarket(
        string calldata question,
        uint256 closesAt,
        address resolver
    ) external returns (address market) {
        if (!curators[msg.sender]) revert NotCurator();
        if (!resolvers[resolver])  revert UnknownResolver();

        PredictionMarket m = new PredictionMarket(
            collateral,
            resolver,
            treasury,
            question,
            closesAt,
            disputeWindow,
            feeBps
        );
        market = address(m);
        markets.push(market);

        emit MarketCreated(market, msg.sender, question, closesAt);
    }

    function marketsLength() external view returns (uint256) {
        return markets.length;
    }
}
