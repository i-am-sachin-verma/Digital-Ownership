// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    GAS OPTIMIZED STORAGE CONTRACT
    ============================================================

    This contract demonstrates:
    - Avoiding redundant SLOAD
    - Minimizing SSTORE
    - Using memory caching
    - Efficient looping
    - Conditional writes

    NOTE:
    This is a demo-heavy file with extensive comments for learning.
*/

contract OptimizedStorage {
    
    // ============================================================
    // STORAGE VARIABLES
    // ============================================================

    // Mapping of user balances
    mapping(address => uint256) public balances;

    // Struct to store user data
    struct User {
        uint256 balance;
        uint256 lastUpdated;
        bool isActive;
    }

    mapping(address => User) public users;

    uint256 public totalSupply;

    // ============================================================
    // EVENTS
    // ============================================================

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event BatchUpdate(uint256 count);

    // ============================================================
    // BASIC FUNCTION (NON-OPTIMIZED EXAMPLE)
    // ============================================================

    function depositBad() external payable {
        // ❌ BAD PRACTICE:
        // Multiple storage reads and writes

        balances[msg.sender] = balances[msg.sender] + msg.value;
        totalSupply = totalSupply + msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    // ============================================================
    // OPTIMIZED FUNCTION
    // ============================================================

    function depositGood() external payable {
        // ✅ STEP 1: Cache storage value in memory
        uint256 currentBalance = balances[msg.sender];

        // ✅ STEP 2: Compute in memory
        uint256 newBalance = currentBalance + msg.value;

        // ✅ STEP 3: Single SSTORE
        balances[msg.sender] = newBalance;

        // ✅ Cache totalSupply
        uint256 currentSupply = totalSupply;
        totalSupply = currentSupply + msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    // ============================================================
    // STRUCT OPTIMIZATION
    // ============================================================

    function updateUserBad(uint256 amount) external {
        // ❌ Multiple storage reads
        users[msg.sender].balance += amount;
        users[msg.sender].lastUpdated = block.timestamp;
        users[msg.sender].isActive = true;
    }

    function updateUserGood(uint256 amount) external {
        // ✅ Cache struct in storage pointer
        User storage user = users[msg.sender];

        // Now only ONE storage pointer lookup
        user.balance += amount;
        user.lastUpdated = block.timestamp;
        user.isActive = true;
    }

    // ============================================================
    // CONDITIONAL WRITE OPTIMIZATION
    // ============================================================

    function setBalance(uint256 newBalance) external {
        uint256 currentBalance = balances[msg.sender];

        // ✅ Only write if value changes
        if (currentBalance != newBalance) {
            balances[msg.sender] = newBalance;
        }
    }

    // ============================================================
    // LOOP OPTIMIZATION
    // ============================================================

    function batchDeposit(address[] calldata usersList, uint256 amount) external {
        uint256 length = usersList.length;

        // ✅ Cache totalSupply once
        uint256 tempSupply = totalSupply;

        for (uint256 i = 0; i < length; ) {
            address user = usersList[i];

            // ✅ Cache user balance
            uint256 currentBalance = balances[user];
            balances[user] = currentBalance + amount;

            tempSupply += amount;

            unchecked {
                i++; // cheaper increment
            }
        }

        // ✅ Single write
        totalSupply = tempSupply;

        emit BatchUpdate(length);
    }

    // ============================================================
    // WITHDRAW OPTIMIZATION
    // ============================================================

    function withdraw(uint256 amount) external {
        uint256 currentBalance = balances[msg.sender];

        require(currentBalance >= amount, "Insufficient");

        uint256 newBalance = currentBalance - amount;

        // Single write
        balances[msg.sender] = newBalance;

        totalSupply -= amount;

        payable(msg.sender).transfer(amount);

        emit Withdraw(msg.sender, amount);
    }

    // ============================================================
    // ADVANCED: MEMORY CACHING FOR MULTIPLE READS
    // ============================================================

    function complexCalculation(address user) external view returns (uint256) {
        // ❌ Without caching → multiple SLOAD
        // balances[user] + balances[user] + balances[user]

        // ✅ Cache once
        uint256 balance = balances[user];

        return balance + balance + balance;
    }

    // ============================================================
    // MULTI-FIELD OPTIMIZATION
    // ============================================================

    function updateUserEfficient(uint256 amount) external {
        User storage user = users[msg.sender];

        uint256 newBalance = user.balance + amount;

        user.balance = newBalance;
        user.lastUpdated = block.timestamp;

        // Only update if needed
        if (!user.isActive) {
            user.isActive = true;
        }
    }

    // ============================================================
    // GAS SAVING VIA LOCAL VARIABLES
    // ============================================================

    function calculateRewards(address user) external view returns (uint256) {
        uint256 balance = balances[user];

        // Avoid multiple reads
        uint256 reward = (balance * 5) / 100;

        return reward;
    }

    // ============================================================
    // DEMONSTRATING BAD VS GOOD LOOP
    // ============================================================

    function badLoop(address[] calldata list) external view returns (uint256 total) {
        for (uint256 i = 0; i < list.length; i++) {
            total += balances[list[i]]; // repeated SLOAD
        }
    }

    function goodLoop(address[] calldata list) external view returns (uint256 total) {
        uint256 length = list.length;

        for (uint256 i = 0; i < length; ) {
            uint256 bal = balances[list[i]];
            total += bal;

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // EXTREME CASE: AGGREGATION OPTIMIZATION
    // ============================================================

    function aggregateBalances(address[] calldata list) external view returns (uint256 sum) {
        uint256 length = list.length;

        for (uint256 i = 0; i < length; ) {
            sum += balances[list[i]];

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // STORAGE WRITE MINIMIZATION
    // ============================================================

    function safeUpdate(uint256 newValue) external {
        uint256 oldValue = balances[msg.sender];

        if (oldValue != newValue) {
            balances[msg.sender] = newValue;
        }
    }

    // ============================================================
    // FALLBACK
    // ============================================================

    receive() external payable {
        depositGood();
    }
}