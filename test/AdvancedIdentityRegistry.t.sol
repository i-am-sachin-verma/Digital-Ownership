// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AdvancedIdentityRegistry} from "../contracts/core/AdavnceControl.sol";

contract MockAdvancedIdentityRegistry is AdvancedIdentityRegistry {
    function setBannedWallet(address wallet, bool status) external {
        bannedWallets[wallet] = status;
    }
    
    // Helper to expose burn for testing
    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}

contract AdvancedIdentityRegistryTest is Test {
    MockAdvancedIdentityRegistry public registry;

    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public backup = address(0x4);
    address public bannedUser = address(0x5);

    function setUp() public {
        vm.startPrank(admin);
        registry = new MockAdvancedIdentityRegistry();
        vm.stopPrank();
    }

    function test_MintIdentity() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        assertEq(registry.balanceOf(user1), 1);
        assertEq(registry.walletToToken(user1), 1);
        
        (uint256 tokenId, address owner, , uint256 reputation, , , string memory metadataURI) = registry.identities(1);
        assertEq(tokenId, 1);
        assertEq(owner, user1);
        assertEq(reputation, 1);
        assertEq(metadataURI, "ipfs://user1-metadata");
    }

    function test_StandardTransfer() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        // Set recovery wallet
        vm.prank(user1);
        registry.registerRecoveryWallet(1, backup);
        assertEq(registry.recoveryWallet(1), backup);

        // Perform standard transfer (user1 to user2)
        vm.prank(user1);
        registry.safeTransferFrom(user1, user2, 1);

        // Verify state is updated/cleared
        assertEq(registry.balanceOf(user1), 0);
        assertEq(registry.balanceOf(user2), 1);

        assertEq(registry.walletToToken(user1), 0);
        assertEq(registry.walletToToken(user2), 1);
        assertEq(registry.recoveryWallet(1), address(0));

        (, address owner, , , , , ) = registry.identities(1);
        assertEq(owner, user2);
    }

    function test_TransferReverts_RecipientAlreadyHasIdentity() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        vm.prank(user2);
        registry.mintIdentity("ipfs://user2-metadata");

        // Attempting to transfer user1's identity to user2 should revert
        vm.prank(user1);
        vm.expectRevert("Recipient already owns identity");
        registry.transferFrom(user1, user2, 1);
    }

    function test_TransferReverts_RecipientIsBanned() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        // Ban user2
        registry.setBannedWallet(user2, true);

        // Attempting to transfer user1's identity to user2 (banned) should revert
        vm.prank(user1);
        vm.expectRevert("Recipient wallet banned");
        registry.transferFrom(user1, user2, 1);
    }

    function test_RecoveryProcess() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        // Register recovery wallet
        vm.prank(user1);
        registry.registerRecoveryWallet(1, backup);

        // Recover identity using backup wallet
        vm.prank(backup);
        registry.recoverIdentity(1);

        // Verify state
        assertEq(registry.balanceOf(user1), 0);
        assertEq(registry.balanceOf(backup), 1);
        assertEq(registry.walletToToken(user1), 0);
        assertEq(registry.walletToToken(backup), 1);
        assertEq(registry.recoveryWallet(1), address(0)); // Should be cleared during recovery transfer

        (, address owner, , , bool compromised, , ) = registry.identities(1);
        assertEq(owner, backup);
        assertFalse(compromised);
    }

    function test_BurnClearsState() public {
        vm.prank(user1);
        registry.mintIdentity("ipfs://user1-metadata");

        // Register recovery wallet
        vm.prank(user1);
        registry.registerRecoveryWallet(1, backup);

        // Burn the identity NFT
        registry.burn(1);

        // Verify state is cleared
        assertEq(registry.balanceOf(user1), 0);
        assertEq(registry.walletToToken(user1), 0);
        assertEq(registry.recoveryWallet(1), address(0));

        (uint256 tokenId, address owner, , , , , ) = registry.identities(1);
        assertEq(tokenId, 0);
        assertEq(owner, address(0));
    }
}
