// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LoopOptimizer {
    uint256[] private data;

    function addData(uint256[] calldata _values) external {
        uint256 len = _values.length;

        // Cache length to avoid repeated reads
        for (uint256 i = 0; i < len; ) {
            data.push(_values[i]);

            unchecked {
                ++i; // saves gas
            }
        }
    }

    function sum() external view returns (uint256 total) {
        uint256 len = data.length;

        for (uint256 i = 0; i < len; ) {
            total += data[i];

            unchecked {
                ++i;
            }
        }
    }
}