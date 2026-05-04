// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MinimalProxy} from "../src/Proxy.sol";
import {SovereignIdentityRegistry} from "../src/SovereignIdentityRegistry.sol";
import {CoreLogic} from "../src/CoreLogic.sol";

contract ProxyTest is Test {
    SovereignIdentityRegistry public registry;
    CoreLogic public logic;
    MinimalProxy public proxy;
    
    // We cast the proxy address to CoreLogic so we can call its functions
    CoreLogic public proxyAsLogic;

    address public admin = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        registry = new SovereignIdentityRegistry();
        logic = new CoreLogic(address(registry));
        
        // Deploy Proxy pointing to CoreLogic
        proxy = new MinimalProxy(address(logic));
        proxyAsLogic = CoreLogic(address(proxy));
    }

    function test_Proxy_Delegation() public {
        // 1. Register identity in the registry
        vm.prank(user);
        registry.registerIdentity(keccak256("user_id"));

        // 2. Call setData THROUGH the proxy
        vm.prank(user);
        proxyAsLogic.setData(1, "Proxy Data");

        // 3. Verify data is stored in the PROXY's storage (not the logic contract's)
        assertEq(proxyAsLogic.getData(1), "Proxy Data");
        
        // 4. Verify logic contract storage is still empty
        vm.expectRevert("Data not found for this ID");
        logic.getData(1);
    }
}
