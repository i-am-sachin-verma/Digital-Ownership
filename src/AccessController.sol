// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignIdentityRegistry.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract AccessController is Initializable {

    SovereignIdentityRegistry public immutable identityRegistry;
    address public securityCouncil;

    mapping(address => bool) private admins;
    mapping(address => bool) private suspendedAdmins;
    uint256 public adminCount;

    event AdminAdded(address indexed user);
    event AdminSuspended(address indexed user);
    event AdminReinstated(address indexed user);
    event AdminRemoved(address indexed user);

    constructor(address registryAddress) {
        require(registryAddress != address(0), "Invalid registry address");
        identityRegistry = SovereignIdentityRegistry(registryAddress);
    }

    function initialize(address _securityCouncil, address _admin) public initializer {
        require(_securityCouncil != address(0), "Invalid security council");
        require(_admin != address(0), "Invalid admin address");
        
        securityCouncil = _securityCouncil;
        admins[_admin] = true;
        adminCount = 1;
        emit AdminAdded(_admin);
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
        require(user != address(0), "Invalid user address");
        require(admins[user], "Not an admin");
        suspendedAdmins[user] = true;
        emit AdminSuspended(user);
    }

    function reinstateAdmin(address user) external onlySecurityCouncil {
        require(user != address(0), "Invalid user address");
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
        adminCount++;
        emit AdminAdded(user);
    }

    function removeAdmin(address user) external onlyAdmin {
        require(admins[user], "Not an admin");
        require(user != msg.sender, "Cannot remove self");
        require(adminCount > 1, "Must have at least one admin");

        admins[user] = false;
        adminCount--;
        emit AdminRemoved(user);
    }

    function isAdmin(address user) external view returns (bool) {
        require(user != address(0), "Invalid user address");
        return admins[user];
    }
}