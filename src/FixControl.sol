// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoopOptimizationDemo {

    mapping(address => uint256) public balances;

    /*
    ============================================================
    BAD IMPLEMENTATION
    - Repeated length access
    - Checked increment
    - No caching
    ============================================================
    */
    function sumBalancesBad(address[] calldata users) external view returns (uint256 total) {
        for (uint256 i = 0; i < users.length; i++) {
            total += balances[users[i]];
        }
    }

    /*
    ============================================================
     GOOD IMPLEMENTATION
    - Cached length
    - Unchecked increment
    - Reduced overhead
    ============================================================
    */
    function sumBalancesOptimized(address[] calldata users) external view returns (uint256 total) {

        uint256 len = users.length; // cache length

        for (uint256 i = 0; i < len;) {

            address user = users[i]; // cache array read

            total += balances[user];

            unchecked {
                i++; // skip overflow check
            }
        }
    }

    /*
    ============================================================
     EXTREME OPTIMIZATION (ADVANCED)
    - Minimizing memory operations
    - Tight loop execution
    ============================================================
    */
    function sumBalancesAdvanced(address[] calldata users) external view returns (uint256 total) {

        uint256 len = users.length;

        for (uint256 i; i < len;) {
            total += balances[users[i]];
            unchecked { ++i; }
        }
    }

    /*
    ============================================================
    WHEN TO USE unchecked?
    ============================================================
    Safe ONLY when:
    - You control loop bounds
    - i < len ensures no overflow

    Unsafe:
    - User-controlled infinite loops
    ============================================================
    */

    /*
    ============================================================
     WORST CASE (REAL GAS KILLER)
    ============================================================
    */
    function worstLoop(address[] calldata users) external view returns (uint256 total) {

        for (uint256 i = 0; i < users.length; i++) {

            // MULTIPLE STORAGE READS (VERY BAD)
            total += balances[users[i]];
            total += balances[users[i]];
            total += balances[users[i]];
        }
    }

    /*
    ============================================================
     FIX FOR WORST CASE
    ============================================================
    */
    function fixedLoop(address[] calldata users) external view returns (uint256 total) {

        uint256 len = users.length;

        for (uint256 i; i < len;) {

            uint256 bal = balances[users[i]];

            total += bal;
            total += bal;
            total += bal;

            unchecked { ++i; }
        }
    }
}