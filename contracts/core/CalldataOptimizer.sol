// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    Contract: CalldataOptimizer
    ============================================================

    Purpose:
    --------
    Demonstrates how using `calldata` instead of `memory`
    significantly reduces gas costs in external function calls.

    Core Idea:
    ----------
    - calldata = read-only, no copying → cheaper
    - memory   = copied into RAM → expensive

    Use Case:
    ---------
    Efficient aggregation (sum, batch processing, etc.)

    Gas Optimization Techniques Used:
    --------------------------------
    1. calldata instead of memory
    2. caching array length
    3. unchecked increment
    4. local accumulator variable

    ============================================================
*/

contract CalldataOptimizer {

    /*
        --------------------------------------------------------
        STATE VARIABLES
        --------------------------------------------------------
    */

    // Stores accumulated total of all processed numbers
    // Stored in contract storage → expensive writes
    uint256 public total;

    /*
        --------------------------------------------------------
        FUNCTION: addNumbers
        --------------------------------------------------------

        Accepts an array of numbers and adds them efficiently.

        WHY calldata?
        -------------
        - No memory allocation
        - No copying of array
        - Direct read access from transaction input

        GAS SAVINGS:
        ------------
        calldata << memory

    */
    function addNumbers(uint256[] calldata nums) external {

        // Cache length → avoids repeated SLOAD-like operations
        uint256 len = nums.length;

        // Local variable → cheaper than writing to storage repeatedly
        uint256 sum = 0;

        /*
            LOOP OPTIMIZATION:
            ------------------
            - No i++ (uses unchecked)
            - Cached length
            - No redundant reads
        */
        for (uint256 i = 0; i < len; ) {

            // Direct calldata read (cheap)
            sum += nums[i];

            // unchecked saves gas (no overflow check)
            unchecked {
                ++i;
            }
        }

        /*
            STORAGE WRITE:
            --------------
            Only ONE write instead of many → major gas saving
        */
        total += sum;
    }

    /*
        --------------------------------------------------------
        FUNCTION: getTotal
        --------------------------------------------------------

        Returns current total.

        NOTE:
        -----
        Marked as view → no gas when called off-chain
    */
    function getTotal() external view returns (uint256) {
        return total;
    }
}