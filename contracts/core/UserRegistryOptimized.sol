// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    FILE: UserRegistryOptimized.sol
    ============================================================

    Focus:
    - Struct optimization
    - Storage pointer reuse
    - Avoiding redundant writes
    - Efficient user management

    Use Case:
    User profile registry in dApps
*/

contract UserRegistryOptimized {

    // ============================================================
    // STRUCT
    // ============================================================

    struct User {
        uint256 balance;
        uint256 lastActive;
        bool isVerified;
        bool exists;
    }

    mapping(address => User) public users;

    uint256 public userCount;

    // ============================================================
    // EVENTS
    // ============================================================

    event UserCreated(address user);
    event UserUpdated(address user);

    // ============================================================
    // CREATE USER
    // ============================================================

    function createUser() external {
        User storage user = users[msg.sender];

        require(!user.exists, "Already exists");

        user.exists = true;
        user.balance = 0;
        user.lastActive = block.timestamp;

        userCount++;

        emit UserCreated(msg.sender);
    }

    // ============================================================
    // BAD UPDATE
    // ============================================================

    function updateBad(uint256 amount) external {
        users[msg.sender].balance += amount;
        users[msg.sender].lastActive = block.timestamp;
    }

    // ============================================================
    // GOOD UPDATE
    // ============================================================

    function updateGood(uint256 amount) external {
        User storage user = users[msg.sender];

        uint256 newBalance = user.balance + amount;

        user.balance = newBalance;
        user.lastActive = block.timestamp;
    }

    // ============================================================
    // CONDITIONAL FLAGS
    // ============================================================

    function verifyUser() external {
        User storage user = users[msg.sender];

        if (!user.isVerified) {
            user.isVerified = true;
        }
    }

    // ============================================================
    // BATCH VERIFY
    // ============================================================

    function batchVerify(address[] calldata list) external {
        uint256 length = list.length;

        for (uint256 i = 0; i < length; ) {
            User storage user = users[list[i]];

            if (!user.isVerified) {
                user.isVerified = true;
            }

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // READ OPTIMIZATION
    // ============================================================

    function getUserData(address userAddr)
        external
        view
        returns (uint256 balance, uint256 lastActive, bool verified)
    {
        User storage user = users[userAddr];

        return (user.balance, user.lastActive, user.isVerified);
    }

    // ============================================================
    // MULTIPLE READ CACHE
    // ============================================================

    function calculateScore(address userAddr) external view returns (uint256) {
        User storage user = users[userAddr];

        uint256 balance = user.balance;
        uint256 lastActive = user.lastActive;

        return balance + (block.timestamp - lastActive);
    }

    // ============================================================
    // RESET USER
    // ============================================================

    function resetUser(address userAddr) external {
        User storage user = users[userAddr];

        if (user.exists) {
            user.balance = 0;
            user.isVerified = false;
        }
    }

    // ============================================================
    // DELETE USER (GAS REFUND CASE)
    // ============================================================

    function deleteUser(address userAddr) external {
        User storage user = users[userAddr];

        if (user.exists) {
            delete users[userAddr];
            userCount--;
        }
    }

    // ============================================================
    // LOOP ACCESS OPTIMIZATION
    // ============================================================

    function totalBalances(address[] calldata list) external view returns (uint256 total) {
        uint256 length = list.length;

        for (uint256 i = 0; i < length; ) {
            total += users[list[i]].balance;

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // SAFE UPDATE
    // ============================================================

    function safeUpdate(address userAddr, uint256 newBalance) external {
        User storage user = users[userAddr];

        if (user.balance != newBalance) {
            user.balance = newBalance;
        }
    }

    // ============================================================
    // HEARTBEAT (FREQUENT FUNCTION OPTIMIZED)
    // ============================================================

    function heartbeat() external {
        User storage user = users[msg.sender];

        user.lastActive = block.timestamp;
    }
}