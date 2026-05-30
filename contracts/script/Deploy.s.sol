// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {Faucet} from "../src/Faucet.sol";

/// @notice Deploys MockUSDC + Faucet + MarketFactory to X Layer Testnet, whitelists the
///         curator + resolver agent wallets, and distributes the 100M mUSDC supply:
///           - 50M to the Faucet (users can claim 10k each, once per address forever)
///           -  5M to the Curator agent (so it can seed AMM liquidity on new markets)
///           - 45M to the Deployer (admin reserve for Discord-based airdrops)
///
/// Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url xlayer_testnet \
///     --private-key $DEPLOYER_PRIVATE_KEY \
///     --broadcast
///
/// Required env vars:
///   DEPLOYER_PRIVATE_KEY   - the deployer wallet (becomes admin of MockUSDC + Faucet + Factory)
///   CURATOR_ADDRESS        - Privy server wallet that creates markets
///   RESOLVER_ADDRESS       - Privy server wallet that resolves markets
///   TREASURY_ADDRESS       - where protocol trading fees go (deployer is fine)
contract Deploy is Script {
    uint256 constant DECIMALS    = 1e6;            // 6 decimals
    uint256 constant TOTAL       = 100_000_000 * DECIMALS;
    uint256 constant TO_FAUCET   =  50_000_000 * DECIMALS;
    uint256 constant TO_CURATOR  =   5_000_000 * DECIMALS;
    // remainder (45M) goes to deployer

    uint256 constant CLAIM_AMOUNT = 10_000 * DECIMALS; // 10k per user, once

    function run() external {
        address curator  = vm.envAddress("CURATOR_ADDRESS");
        address resolver = vm.envAddress("RESOLVER_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address deployer = vm.addr(vm.envUint("DEPLOYER_PRIVATE_KEY"));

        vm.startBroadcast();

        // 1. MockUSDC
        MockUSDC usdc = new MockUSDC();
        console2.log("MockUSDC:", address(usdc));

        // 2. Faucet
        Faucet faucet = new Faucet(address(usdc), CLAIM_AMOUNT);
        console2.log("Faucet:  ", address(faucet));

        // 3. MarketFactory
        MarketFactory factory = new MarketFactory(address(usdc), treasury);
        console2.log("Factory: ", address(factory));

        // 4. Whitelist agents
        factory.setCurator(curator, true);
        factory.setResolver(resolver, true);

        // 5. Distribute 100M mUSDC
        usdc.mint(address(faucet), TO_FAUCET);  // 50M
        usdc.mint(curator,         TO_CURATOR); //  5M
        usdc.mint(deployer,        TOTAL - TO_FAUCET - TO_CURATOR); // 45M

        vm.stopBroadcast();

        console2.log("=== DEPLOYMENT SUMMARY ===");
        console2.log("NEXT_PUBLIC_USDC_ADDRESS=%s",    address(usdc));
        console2.log("NEXT_PUBLIC_FAUCET_ADDRESS=%s",  address(faucet));
        console2.log("NEXT_PUBLIC_FACTORY_ADDRESS=%s", address(factory));
        console2.log("Distribution: 50M -> faucet | 5M -> curator | 45M -> deployer");
    }
}
