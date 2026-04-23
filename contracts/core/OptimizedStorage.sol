// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimizedStorage {
    // Packed storage (saves gas)
    struct User {
        uint128 balance;
        uint64 lastUpdated;
        bool isActive;
    }

    mapping(address => User) private users;

    function updateBalance(uint128 _amount) external {
        User storage user = users[msg.sender];

        // Cache in memory (gas optimization)
        uint128 newBalance = user.balance + _amount;

        user.balance = newBalance;
        user.lastUpdated = uint64(block.timestamp);
        user.isActive = true;
    }

    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }
}