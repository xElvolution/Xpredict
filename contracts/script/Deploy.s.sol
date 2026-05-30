// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {MarketFactory} from "../src/MarketFactory.sol";

/// @notice Deploys MockUSDC + MarketFactory to X Layer Testnet and whitelists
///         the curator + resolver agent wallets passed via env.
///
/// Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url xlayer_testnet \
///     --private-key $DEPLOYER_PRIVATE_KEY \
///     --broadcast
///
/// Required env vars:
///   DEPLOYER_PRIVATE_KEY  - the deployer wallet (also becomes factory admin)
///   CURATOR_ADDRESS       - Privy server wallet that creates markets
///   RESOLVER_ADDRESS      - Privy server wallet that resolves markets
///   TREASURY_ADDRESS      - where protocol fees go (can be deployer for now)
contract Deploy is Script {
    function run() external {
        address curator   = vm.envAddress("CURATOR_ADDRESS");
        address resolver  = vm.envAddress("RESOLVER_ADDRESS");
        address treasury  = vm.envAddress("TREASURY_ADDRESS");

        vm.startBroadcast();

        // 1. Deploy MockUSDC (only for testnet — on mainnet use real USDC address)
        MockUSDC usdc = new MockUSDC();
        console2.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy MarketFactory
        MarketFactory factory = new MarketFactory(address(usdc), treasury);
        console2.log("MarketFactory deployed at:", address(factory));

        // 3. Whitelist agents
        factory.setCurator(curator, true);
        factory.setResolver(resolver, true);
        console2.log("Curator whitelisted:", curator);
        console2.log("Resolver whitelisted:", resolver);

        // 4. Mint some test USDC to the curator so they can seed market liquidity
        usdc.mint(curator, 100_000 * 1e6); // 100k mUSDC
        console2.log("Minted 100k mUSDC to curator");

        vm.stopBroadcast();

        // Print summary for easy copy-paste into .env
        console2.log("=== DEPLOYMENT SUMMARY ===");
        console2.log("NEXT_PUBLIC_USDC_ADDRESS=%s", address(usdc));
        console2.log("NEXT_PUBLIC_FACTORY_ADDRESS=%s", address(factory));
    }
}
