// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignIdentityRegistry.sol";

contract AccessController {

    SovereignIdentityRegistry public identityRegistry;

    mapping(address => bool) private admins;

    event AdminAdded(address indexed user);

    constructor(address registryAddress) {
        identityRegistry = SovereignIdentityRegistry(registryAddress);
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        _;
    }

    modifier onlyVerifiedUser() {
        require(identityRegistry.isRegistered(msg.sender), "Identity required");
        _;
    }

    function addAdmin(address user) external onlyAdmin {
        admins[user] = true;
        emit AdminAdded(user);
    }

    function isAdmin(address user) external view returns (bool) {
        return admins[user];
    }
}