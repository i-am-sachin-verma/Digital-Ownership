// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignIdentityRegistry.sol";

contract AccessController {

    SovereignIdentityRegistry public identityRegistry;

    mapping(address => bool) private admins;

    event AdminAdded(address indexed user);

    constructor(address registryAddress) {
        require(registryAddress != address(0), "Invalid registry address");
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
        require(user != address(0), "Invalid user address");
        require(!admins[user], "Already an admin");
        admins[user] = true;
        emit AdminAdded(user);
    }

    function isAdmin(address user) external view returns (bool) {
        require(user != address(0), "Invalid user address");
        return admins[user];
    }
}