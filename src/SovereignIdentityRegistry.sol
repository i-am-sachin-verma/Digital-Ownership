// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SovereignIdentityRegistry {

    mapping(address => bytes32) private identityHash;
    mapping(address => bool) private registered;

    event IdentityRegistered(address indexed user, bytes32 identityHash);

    error AlreadyRegistered();
    error InvalidIdentity();
    error NotRegistered();

    function registerIdentity(bytes32 _identityHash) external {
        require(!registered[msg.sender], "User already registered");
        require(_identityHash != bytes32(0), "Invalid identity hash");

        identityHash[msg.sender] = _identityHash;
        registered[msg.sender] = true;

        emit IdentityRegistered(msg.sender, _identityHash);
    }

    function isRegistered(address user) external view returns (bool) {
        require(user != address(0), "Invalid user address");
        return registered[user];
    }

    function getIdentityHash(address user) external view returns (bytes32) {
        require(user != address(0), "Invalid user address");
        require(registered[user], "User not registered");
        return identityHash[user];
    }

    function verifyIdentity(address user, bytes32 _hash) external view returns (bool) {
        require(user != address(0), "Invalid user address");
        require(_hash != bytes32(0), "Invalid hash to verify");
        return identityHash[user] == _hash;
    }
}