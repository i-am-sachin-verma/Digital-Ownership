// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AntiCollusionDetection.sol";

/**
 * AntiCollusionPenalty.sol
 * ----------------------------------------------------
 * Applies penalties based on suspicion score.
 *
 * This connects directly with your:
 * - endorsement system
 * - trust scoring system
 */

contract AntiCollusionPenalty is AntiCollusionDetection {

    // Threshold for penalization
    uint256 public constant PENALTY_THRESHOLD = 100;

    // Reputation score (example)
    mapping(uint256 => uint256) public reputation;

    /**
     * Public function to endorse (entry point)
     */
    function endorse(uint256 from, uint256 to) external {
        require(from != to, "Self endorsement not allowed");

        _addEdge(from, to);

        // Detect suspicious behavior
        _evaluateSuspicion(from, to);

        // Apply penalty if needed
        _applyPenalty(to);

        // Update reputation
        _updateReputation(to);
    }

    /**
     * Apply penalty if suspicion is high
     */
    function _applyPenalty(uint256 tokenId) internal {
        if (suspicionScore[tokenId] >= PENALTY_THRESHOLD && !penalized[tokenId]) {
            penalized[tokenId] = true;

            // Reduce reputation drastically
            if (reputation[tokenId] > 50) {
                reputation[tokenId] -= 50;
            } else {
                reputation[tokenId] = 0;
            }

            emit Penalized(tokenId);
        }
    }

    /**
     * Update reputation normally
     */
    function _updateReputation(uint256 tokenId) internal {
        if (penalized[tokenId]) {
            // Penalized identities gain less trust
            reputation[tokenId] += 1;
        } else {
            reputation[tokenId] += 5;
        }
    }

    /**
     * Getter for trust score (after penalty)
     */
    function getTrustScore(uint256 tokenId) external view returns (uint256) {
        return reputation[tokenId];
    }

    /**
     * Debug helper
     */
    function getNeighbors(uint256 tokenId) external view returns (uint256[] memory) {
        return outgoing[tokenId];
    }
}