// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    FILE: BatchProcessorOptimized.sol
    ============================================================

    Focus:
    - Batch operations optimization
    - Reducing repeated SLOAD in loops
    - Minimizing SSTORE writes
    - Memory caching for arrays

    Use Case:
    Efficient batch updates (airdrops, rewards, etc.)
*/

contract BatchProcessorOptimized {

    // ============================================================
    // STORAGE
    // ============================================================

    mapping(address => uint256) public balances;
    uint256 public totalDistributed;

    // ============================================================
    // EVENTS
    // ============================================================

    event BatchProcessed(uint256 count, uint256 totalAmount);

    // ============================================================
    // BAD IMPLEMENTATION
    // ============================================================

    function distributeBad(address[] calldata users, uint256 amount) external {
        // ❌ Each iteration reads & writes storage multiple times

        for (uint256 i = 0; i < users.length; i++) {
            balances[users[i]] += amount;
            totalDistributed += amount;
        }
    }

    // ============================================================
    // OPTIMIZED IMPLEMENTATION
    // ============================================================

    function distributeGood(address[] calldata users, uint256 amount) external {
        uint256 length = users.length;

        // ✅ Cache totalDistributed
        uint256 tempTotal = totalDistributed;

        for (uint256 i = 0; i < length; ) {
            address user = users[i];

            // ✅ Cache balance
            uint256 currentBalance = balances[user];

            // ✅ Compute in memory
            uint256 newBalance = currentBalance + amount;

            // ✅ Single write
            balances[user] = newBalance;

            tempTotal += amount;

            unchecked {
                i++;
            }
        }

        // ✅ Single SSTORE
        totalDistributed = tempTotal;

        emit BatchProcessed(length, tempTotal);
    }

    // ============================================================
    // MULTI-AMOUNT DISTRIBUTION
    // ============================================================

    function distributeVariable(
        address[] calldata users,
        uint256[] calldata amounts
    ) external {
        require(users.length == amounts.length, "Mismatch");

        uint256 length = users.length;
        uint256 tempTotal = totalDistributed;

        for (uint256 i = 0; i < length; ) {
            address user = users[i];
            uint256 amt = amounts[i];

            uint256 bal = balances[user];
            balances[user] = bal + amt;

            tempTotal += amt;

            unchecked {
                i++;
            }
        }

        totalDistributed = tempTotal;
    }

    // ============================================================
    // CONDITIONAL WRITE
    // ============================================================

    function setBalanceIfChanged(address user, uint256 newValue) external {
        uint256 old = balances[user];

        // ✅ Avoid unnecessary SSTORE
        if (old != newValue) {
            balances[user] = newValue;
        }
    }

    // ============================================================
    // AGGREGATION
    // ============================================================

    function sumBalances(address[] calldata users) external view returns (uint256 sum) {
        uint256 length = users.length;

        for (uint256 i = 0; i < length; ) {
            sum += balances[users[i]];

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // DOUBLE LOOP BAD VS GOOD
    // ============================================================

    function badDoubleLoop(address[] calldata users) external view returns (uint256 total) {
        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < users.length; j++) {
                total += balances[users[j]]; // repeated SLOAD
            }
        }
    }

    function goodDoubleLoop(address[] calldata users) external view returns (uint256 total) {
        uint256 length = users.length;

        for (uint256 i = 0; i < length; ) {
            uint256 innerSum;

            for (uint256 j = 0; j < length; ) {
                innerSum += balances[users[j]];

                unchecked { j++; }
            }

            total += innerSum;

            unchecked { i++; }
        }
    }

    // ============================================================
    // BULK RESET OPTIMIZATION
    // ============================================================

    function resetBalances(address[] calldata users) external {
        uint256 length = users.length;

        for (uint256 i = 0; i < length; ) {
            address user = users[i];

            if (balances[user] != 0) {
                balances[user] = 0;
            }

            unchecked {
                i++;
            }
        }
    }

    // ============================================================
    // EDGE CASE HANDLING
    // ============================================================

    function safeBatch(address[] calldata users, uint256 amount) external {
        require(users.length > 0, "Empty");

        uint256 tempTotal = totalDistributed;

        for (uint256 i = 0; i < users.length; ) {
            address user = users[i];

            if (user != address(0)) {
                balances[user] += amount;
                tempTotal += amount;
            }

            unchecked {
                i++;
            }
        }

        totalDistributed = tempTotal;
    }
}