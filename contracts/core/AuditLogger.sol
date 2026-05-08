// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLogger {
    event ActionLogged(address indexed user, string action, uint256 timestamp);

    function logAction(string memory action) external {
        emit ActionLogged(msg.sender, action, block.timestamp);
    }
}