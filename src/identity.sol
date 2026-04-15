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
        if (registered[msg.sender]) revert AlreadyRegistered();
        if (_identityHash == bytes32(0)) revert InvalidIdentity();

        identityHash[msg.sender] = _identityHash;
        registered[msg.sender] = true;

        emit IdentityRegistered(msg.sender, _identityHash);
    }

    function isRegistered(address user) external view returns (bool) {
        return registered[user];
    }

    function getIdentityHash(address user) external view returns (bytes32) {
        if (!registered[user]) revert NotRegistered();
        return identityHash[user];
    }

    function verifyIdentity(address user, bytes32 _hash) external view returns (bool) {
        return identityHash[user] == _hash;
    }
}