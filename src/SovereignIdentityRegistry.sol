// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SovereignIdentityRegistry
 * @dev Manages registration and validation of decentralized identity hashes for sovereign users.
 */
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

    /**
     * @notice Registers a unique identity hash for the calling address.
     * @param _identityHash The cryptographic hash representing the user's identity details.
     */
    function registerIdentity(bytes32 _identityHash) external {
        Identity storage identity = identities[msg.sender];
        if (identity.registered) revert AlreadyRegistered();
        if (_identityHash == bytes32(0)) revert InvalidIdentity();
        
        identity.hash = _identityHash;
        identity.registered = true;

        emit IdentityRegistered(msg.sender, _identityHash);
    }

    /**
     * @notice Checks if a user is registered in the sovereign registry.
     * @param user The address to check registration status for.
     * @return registered True if the user is registered, false otherwise.
     */
    function isRegistered(address user) external view returns (bool registered) {
        assembly {
            if iszero(user) {
                // Store selector for InvalidIdentity() (0x3eb1c28c)
                mstore(0x00, 0x3eb1c28c00000000000000000000000000000000000000000000000000000000)
                revert(0x00, 0x04)
            }
        }
        return identities[user].registered;
    }

    /**
     * @notice Retrieves the registered identity hash for a given user.
     * @param user The address of the user.
     * @return The registered identity hash of the user.
     */
    function getIdentityHash(address user) external view returns (bytes32) {
        if (user == address(0)) revert InvalidIdentity();
        Identity storage identity = identities[user];
        if (!identity.registered) revert NotRegistered();
        return identity.hash;
    }

    /**
     * @notice Verifies if a user's registered identity matches the provided hash.
     * @param user The address of the user.
     * @param _hash The identity hash to verify against.
     * @return True if the hash matches, false otherwise.
     */
    function verifyIdentity(address user, bytes32 _hash) external view returns (bool) {
        if (user == address(0)) revert InvalidIdentity();
        if (_hash == bytes32(0)) revert InvalidIdentity();
        return identities[user].hash == _hash;
    }
}