// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title Mock USDC for X Layer Testnet
/// @notice ERC-20 with public mint(). Use ONLY on testnet for demos.
contract MockUSDC is IERC20 {
    string  public constant name     = "Mock USD Coin";
    string  public constant symbol   = "mUSDC";
    uint8   public constant decimals = 6;
    uint256 public override totalSupply;

    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    /// Anyone can mint test USDC for themselves. Cap per call to discourage abuse.
    uint256 public constant MINT_CAP = 100_000 * 1e6; // 100,000 mUSDC per call

    function mint(address to, uint256 amount) external returns (bool) {
        require(amount <= MINT_CAP, "mint cap exceeded");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
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
