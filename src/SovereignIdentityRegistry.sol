// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SovereignIdentityRegistry {

    struct Identity {
        bytes32 hash;
        bool registered;
    }

    mapping(address => Identity) private identities;

    event IdentityRegistered(address indexed user, bytes32 identityHash);

    error AlreadyRegistered();
    error InvalidIdentity();
    error NotRegistered();

    function registerIdentity(bytes32 _identityHash) external {
        Identity storage identity = identities[msg.sender];
        if (identity.registered) revert AlreadyRegistered();
        if (_identityHash == bytes32(0)) revert InvalidIdentity();
        
        identity.hash = _identityHash;
        identity.registered = true;

        emit IdentityRegistered(msg.sender, _identityHash);
    }

    function isRegistered(address user) external view returns (bool registered) {
        assembly {
            if iszero(user) {
                mstore(0x00, 0x08c379a0)
                mstore(0x04, 0x20)
                mstore(0x24, 20)
                mstore(0x44, "Invalid user address")
                revert(0x00, 0x64)
            }
        }
        return identities[user].registered;
    }

    function getIdentityHash(address user) external view returns (bytes32) {
        if (user == address(0)) revert InvalidIdentity();
        Identity storage identity = identities[user];
        if (!identity.registered) revert NotRegistered();
        return identity.hash;
    }

    function verifyIdentity(address user, bytes32 _hash) external view returns (bool) {
        if (user == address(0)) revert InvalidIdentity();
        if (_hash == bytes32(0)) revert InvalidIdentity();
        return identities[user].hash == _hash;
    }
}