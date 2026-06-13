// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustWeightOracle {
    string public moduleTopic = "trust weight oracle";
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function calculateAverage(uint256[] calldata weights) external pure returns (uint256) {
        if (weights.length == 0) return 0;
        uint256 sum = 0;
        uint256 validCount = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            if (weights[i] <= 100) { // filter out outlier weights > 100
                sum += weights[i];
                validCount++;
            }
        }
        return validCount == 0 ? 0 : sum / validCount;
    }
}
