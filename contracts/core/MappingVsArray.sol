// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    Contract: MappingVsArray
    ============================================================

    Purpose:
    --------
    Demonstrates why mappings are more gas-efficient than arrays
    for storage-heavy operations.

    Core Idea:
    ----------
    - Arrays → expensive resizing, shifting
    - Mapping → direct slot access (O(1))

    Gas Optimization Techniques:
    ----------------------------
    1. mapping over dynamic array
    2. unchecked increment
    3. minimal storage writes
    4. no bounds checks

    ============================================================
*/

contract MappingVsArray {

    /*
        --------------------------------------------------------
        STATE VARIABLES
        --------------------------------------------------------
    */

    // Mapping instead of array → avoids resizing cost
    mapping(uint256 => uint256) private data;

    // Tracks number of inserted elements
    uint256 public count;

    /*
        --------------------------------------------------------
        FUNCTION: store
        --------------------------------------------------------

        Stores value efficiently.

        WHY mapping?
        ------------
        - Direct storage slot access
        - No push() overhead
        - No dynamic resizing

    */
    function store(uint256 value) external {

        /*
            STORAGE WRITE:
            --------------
            Direct index access → cheaper than array push
        */
        data[count] = value;

        /*
            INCREMENT OPTIMIZATION:
            -----------------------
            unchecked avoids overflow check
        */
        unchecked {
            ++count;
        }
    }

    /*
        --------------------------------------------------------
        FUNCTION: get
        --------------------------------------------------------

        Fetches value from mapping.

        NOTE:
        -----
        No bounds checking → cheaper but requires discipline
    */
    function get(uint256 index) external view returns (uint256) {
        return data[index];
    }

    /*
        --------------------------------------------------------
        FUNCTION: batchStore
        --------------------------------------------------------

        Stores multiple values efficiently.

        Optimization:
        -------------
        - memory array (acceptable here)
        - cached length
        - unchecked loop

    */
    function batchStore(uint256[] calldata values) external {

        uint256 len = values.length;

        for (uint256 i = 0; i < len; ) {

            data[count] = values[i];

            unchecked {
                ++count;
                ++i;
            }
        }
    }
}