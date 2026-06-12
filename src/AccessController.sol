// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SovereignIdentityRegistry.sol";

contract AccessController {

    SovereignIdentityRegistry public immutable identityRegistry;
    address public securityCouncil;

    mapping(address => bool) private admins;
    mapping(address => bool) private suspendedAdmins;
    uint256 public adminCount;

    event AdminAdded(address indexed user);
    event AdminSuspended(address indexed user);
    event AdminReinstated(address indexed user);
    event AdminRemoved(address indexed user);

    // Custom Errors
    error InvalidAddress();
    error NotAdmin();
    error AdminSuspendedError();
    error NotSecurityCouncil();
    error AlreadyAdmin();
    error CannotRemoveSelf();
    error KeepAtLeastOneAdmin();
    error IdentityRequired();

    constructor(address registryAddress, address _securityCouncil) {
        if (registryAddress == address(0)) revert InvalidAddress();
        if (_securityCouncil == address(0)) revert InvalidAddress();
        
        identityRegistry = SovereignIdentityRegistry(registryAddress);
        securityCouncil = _securityCouncil;
        admins[msg.sender] = true;
        adminCount = 1;
    }

    modifier onlyAdmin() {
        if (!admins[msg.sender]) revert NotAdmin();
        if (suspendedAdmins[msg.sender]) revert AdminSuspendedError();
        _;
    }

    modifier onlySecurityCouncil() {
        if (msg.sender != securityCouncil) revert NotSecurityCouncil();
        _;
    }

    function suspendAdmin(address user) external onlySecurityCouncil {
        if (user == address(0)) revert InvalidAddress();
        if (!admins[user]) revert NotAdmin();
        suspendedAdmins[user] = true;
        emit AdminSuspended(user);
    }

    function reinstateAdmin(address user) external onlySecurityCouncil {
        if (user == address(0)) revert InvalidAddress();
        suspendedAdmins[user] = false;
        emit AdminReinstated(user);
    }

    modifier onlyVerifiedUser() {
        if (!identityRegistry.isRegistered(msg.sender)) revert IdentityRequired();
        _;
    }

    function addAdmin(address user) external onlyAdmin {
        if (user == address(0)) revert InvalidAddress();
        if (admins[user]) revert AlreadyAdmin();
        admins[user] = true;
        adminCount++;
        emit AdminAdded(user);
    }

    function removeAdmin(address user) external onlyAdmin {
        if (user == address(0)) revert InvalidAddress();
        if (!admins[user]) revert NotAdmin();
        if (user == msg.sender) revert CannotRemoveSelf();
        if (adminCount <= 1) revert KeepAtLeastOneAdmin();

        admins[user] = false;
        suspendedAdmins[user] = false;
        adminCount--;
        emit AdminRemoved(user);
    }

    function isAdmin(address user) external view returns (bool) {
        if (user == address(0)) revert InvalidAddress();
        return admins[user];
    }
}