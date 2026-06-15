// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IdentityRegistry {
    string public moduleTopic = "Identity Registry";
    address public admin;
    bool private locked;

    mapping(address => bytes32) public identities;

    modifier noReentrancy() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerIdentity(bytes32 idHash) external noReentrancy {
        identities[msg.sender] = idHash;
    }
}
