// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AntiCollusionStorage.sol";

/**
 * AntiCollusionDetection.sol
 * ----------------------------------------------------
 * Implements:
 * 1. Limited cycle detection (depth <= 3)
 * 2. Local cluster density analysis
 *
 * WHY LIMITED DEPTH?
 * Full graph traversal is too expensive on-chain.
 */

contract AntiCollusionDetection is AntiCollusionStorage {

    /**
     * Add endorsement edge
     */
    function _addEdge(uint256 from, uint256 to) internal {
        require(!hasEdge[from][to], "Duplicate edge");

        outgoing[from].push(to);
        incoming[to].push(from);
        hasEdge[from][to] = true;

        endorsementCount[to]++;

        emit EdgeAdded(from, to);
    }

    /**
     * Check simple cycles up to depth 3
     * A -> B -> C -> A
     */
    function _detectCycle(uint256 from, uint256 to) internal view returns (bool) {
        uint256[] memory neighbors = outgoing[to];

        for (uint256 i = 0; i < neighbors.length; i++) {
            uint256 n1 = neighbors[i];

            // direct cycle: A -> B -> A
            if (n1 == from) {
                return true;
            }

            uint256[] memory neighbors2 = outgoing[n1];
            for (uint256 j = 0; j < neighbors2.length; j++) {
                uint256 n2 = neighbors2[j];

                // 3-cycle: A -> B -> C -> A
                if (n2 == from) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Compute local cluster density
     * Density = edges among neighbors / possible edges
     */
    function _clusterDensity(uint256 tokenId) internal view returns (uint256) {
        uint256[] memory neighbors = outgoing[tokenId];
        uint256 n = neighbors.length;

        if (n < 2) return 0;

        uint256 actualEdges = 0;
        uint256 possibleEdges = n * (n - 1);

        for (uint256 i = 0; i < n; i++) {
            for (uint256 j = 0; j < n; j++) {
                if (i == j) continue;

                if (hasEdge[neighbors[i]][neighbors[j]]) {
                    actualEdges++;
                }
            }
        }

        return (actualEdges * 100) / possibleEdges;
    }

    /**
     * Evaluate suspicion score
     */
    function _evaluateSuspicion(uint256 from, uint256 to) internal {
        uint256 score = 0;

        // Cycle detection
        if (_detectCycle(from, to)) {
            score += 50;
        }

        // Cluster density
        uint256 density = _clusterDensity(to);
        if (density > CLUSTER_DENSITY_THRESHOLD) {
            score += 50;
        }

        if (score > 0) {
            suspicionScore[to] += score;
            emit SuspiciousActivity(to, suspicionScore[to]);
        }
    }
}