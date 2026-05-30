// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title Mock USDC for X Layer Testnet
/// @notice Owner-mintable ERC-20. Users do NOT mint directly — they claim from the Faucet
///         contract, or the owner airdrops on demand (e.g. via Discord).
/// @dev Total supply is bounded only by what the owner mints. Decimals = 6 to match real USDC.
contract MockUSDC is IERC20 {
    string  public constant name     = "Mock USD Coin";
    string  public constant symbol   = "mUSDC";
    uint8   public constant decimals = 6;
    uint256 public override totalSupply;

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    address public owner;

    event OwnerTransferred(address indexed previous, address indexed next);

    error NotOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerTransferred(address(0), msg.sender);
    }

    /// @notice Mint mUSDC to any address. Owner only.
    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }

    /// @notice Transfer ownership (e.g. to a multisig or burn address later).
    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero addr");
        emit OwnerTransferred(owner, next);
        owner = next;
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        return _transfer(from, to, amount);
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        uint256 bal = balanceOf[from];
        require(bal >= amount, "balance");
        unchecked { balanceOf[from] = bal - amount; }
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
