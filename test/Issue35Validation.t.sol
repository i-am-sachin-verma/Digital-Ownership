// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SovereignIdentityRegistry} from "../src/SovereignIdentityRegistry.sol";
import {AccessController} from "../src/AccessController.sol";
import {CoreLogic} from "../src/CoreLogic.sol";

contract Issue35ValidationTest is Test {
    SovereignIdentityRegistry public registry;
    AccessController public controller;
    CoreLogic public logic;

    address public admin = address(0x1);
    address public user = address(0x2);
    address public securityCouncil = address(0x3);

    function setUp() public {
        registry = new SovereignIdentityRegistry();
        vm.prank(admin);
        controller = new AccessController(address(registry), securityCouncil);
        vm.prank(admin);
        logic = new CoreLogic(address(registry), securityCouncil);
    }

    // --- SovereignIdentityRegistry Tests ---

    function test_Registry_Fail_ZeroHash() public {
        vm.expectRevert("Invalid identity hash");
        registry.registerIdentity(bytes32(0));
    }

    function test_Registry_Fail_AlreadyRegistered() public {
        registry.registerIdentity(keccak256("identity1"));
        vm.expectRevert("User already registered");
        registry.registerIdentity(keccak256("identity2"));
    }

    function test_Registry_Fail_InvalidAddress() public {
        vm.expectRevert("Invalid user address");
        registry.isRegistered(address(0));
    }

    // --- AccessController Tests ---

    function test_Controller_Fail_ZeroRegistry() public {
        vm.expectRevert("Invalid registry address");
        new AccessController(address(0), securityCouncil);
    }

    function test_Controller_Fail_ZeroSecurityCouncil() public {
        vm.expectRevert("Invalid security council");
        new AccessController(address(registry), address(0));
    }

    function test_Controller_Suspension() public {
        // Suspend the admin
        vm.prank(securityCouncil);
        controller.suspendAdmin(admin);

        // Admin should now fail onlyAdmin check
        vm.prank(admin);
        vm.expectRevert("Admin suspended");
        controller.addAdmin(user);

        // Reinstate
        vm.prank(securityCouncil);
        controller.reinstateAdmin(admin);

        // Should work now
        vm.prank(admin);
        controller.addAdmin(user);
        assertTrue(controller.isAdmin(user));
    }

    function test_Controller_Fail_UnauthorizedSuspend() public {
        vm.prank(admin);
        vm.expectRevert("Not security council");
        controller.suspendAdmin(admin);
    }

    function test_Controller_Fail_AddZeroAdmin() public {
        vm.startPrank(admin);
        vm.expectRevert("Invalid user address");
        controller.addAdmin(address(0));
        vm.stopPrank();
    }

    // --- CoreLogic Tests ---

    function test_Logic_Fail_ZeroID_Set() public {
        // First register identity to pass onlyVerifiedUser
        registry.registerIdentity(keccak256("user"));
        
        vm.expectRevert("ID must be greater than zero");
        logic.setData(0, "some data");
    }

    function test_Logic_Fail_EmptyValue_Set() public {
        registry.registerIdentity(keccak256("user"));
        
        vm.expectRevert("Value cannot be empty");
        logic.setData(1, "");
    }

    function test_Logic_Fail_DataNotFound() public {
        vm.expectRevert("Data not found for this ID");
        logic.getData(999);
    }
}
