// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title XPredict Testnet Faucet
/// @notice Distributes a fixed amount of mUSDC to each address, once per address forever.
///         Users who need more after their single claim should ask the admin (e.g. via Discord).
/// @dev Holds mUSDC funded at deploy time. No cooldown — first claim is the only claim.
contract Faucet {
    IERC20  public immutable token;
    address public           admin;
    uint256 public           claimAmount;     // mUSDC per claim (6 decimals)

    mapping(address => bool) public hasClaimed;

    uint256 public totalClaimed;
    uint256 public claimsCount;

    event Claimed(address indexed user, uint256 amount);
    event AdminTransferred(address indexed previous, address indexed next);
    event ClaimAmountSet(uint256 amount);

    error NotAdmin();
    error AlreadyClaimed();
    error FaucetEmpty();
    error ZeroAddress();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor(address _token, uint256 _claimAmount) {
        if (_token == address(0)) revert ZeroAddress();
        token       = IERC20(_token);
        admin       = msg.sender;
        claimAmount = _claimAmount;
        emit AdminTransferred(address(0), msg.sender);
        emit ClaimAmountSet(_claimAmount);
    }

    /// @notice Claim mUSDC from the faucet. Once per address, forever.
    function claim() external {
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        uint256 balance = token.balanceOf(address(this));
        if (balance < claimAmount) revert FaucetEmpty();

        hasClaimed[msg.sender] = true;
        totalClaimed += claimAmount;
        claimsCount += 1;

        require(token.transfer(msg.sender, claimAmount), "transfer failed");
        emit Claimed(msg.sender, claimAmount);
    }

    /// @notice True if `user` is eligible to claim (hasn't claimed AND faucet has funds).
    function canClaim(address user) external view returns (bool) {
        return !hasClaimed[user] && token.balanceOf(address(this)) >= claimAmount;
    }

    /// @notice Current faucet balance.
    function faucetBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /* --------------------------------------------------------- */
    /*  Admin                                                    */
    /* --------------------------------------------------------- */

    function setClaimAmount(uint256 _amount) external onlyAdmin {
        claimAmount = _amount;
        emit ClaimAmountSet(_amount);
    }

    function transferAdmin(address next) external onlyAdmin {
        if (next == address(0)) revert ZeroAddress();
        emit AdminTransferred(admin, next);
        admin = next;
    }

    /// @notice Withdraw faucet balance back to admin (e.g. to refill / migrate).
    function withdraw(uint256 amount) external onlyAdmin {
        require(token.transfer(admin, amount), "withdraw failed");
    }
}
