// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignIdentityRegistry.sol";

contract AccessController {

    SovereignIdentityRegistry public immutable identityRegistry;
    address public securityCouncil;

    mapping(address => bool) private admins;
    mapping(address => bool) private suspendedAdmins;

    event AdminAdded(address indexed user);
    event AdminSuspended(address indexed user);
    event AdminReinstated(address indexed user);

    constructor(address registryAddress, address _securityCouncil) {
        require(registryAddress != address(0), "Invalid registry address");
        require(_securityCouncil != address(0), "Invalid security council");
        
        identityRegistry = SovereignIdentityRegistry(registryAddress);
        securityCouncil = _securityCouncil;
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not admin");
        require(!suspendedAdmins[msg.sender], "Admin suspended");
        _;
    }

    modifier onlySecurityCouncil() {
        require(msg.sender == securityCouncil, "Not security council");
        _;
    }

    function suspendAdmin(address user) external onlySecurityCouncil {
        require(admins[user], "Not an admin");
        suspendedAdmins[user] = true;
        emit AdminSuspended(user);
    }

    function reinstateAdmin(address user) external onlySecurityCouncil {
        suspendedAdmins[user] = false;
        emit AdminReinstated(user);
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