// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TrustScoreLogic.sol";

/**
 * TrustScoreEngine.sol
 * ----------------------------------------------------
 * Final layer:
 * - Updates scores
 * - Applies penalties
 * - Integrates with anti-collusion module
 */

contract TrustScoreEngine is TrustScoreLogic {

    // Anti-collusion contract (plug-in)
    address public antiCollusionContract;

    /**
     * Set external anti-collusion contract
     */
    function setAntiCollusion(address _contract) external {
        antiCollusionContract = _contract;
    }

    /**
     * Update trust score (state-changing)
     */
    function updateScore(uint256 tokenId) external {
        uint256 score = computeScore(tokenId);

        identities[tokenId].reputation = score;

        emit ScoreUpdated(tokenId, score);
    }

    /**
     * Batch update (gas optimized for multiple identities)
     */
    function batchUpdate(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 score = computeScore(tokenIds[i]);
            identities[tokenIds[i]].reputation = score;

            emit ScoreUpdated(tokenIds[i], score);
        }
    }

    /**
     * Apply manual penalty (from anti-collusion or admin)
     */
    function applyPenalty(uint256 tokenId, uint256 penalty) external {
        penaltyScore[tokenId] += penalty;
    }

    /**
     * Get full trust profile
     */
    function getTrustProfile(uint256 tokenId)
        external
        view
        returns (
            uint256 reputation,
            uint256 endorsements,
            uint256 age,
            uint256 penalty
        )
    {
        Identity memory id = identities[tokenId];

        return (
            id.reputation,
            id.endorsements,
            block.timestamp - id.createdAt,
            penaltyScore[tokenId]
        );
    }

    /**
     * Advanced: trust tier classification
     */
    function getTrustTier(uint256 tokenId) external view returns (string memory) {
        uint256 score = identities[tokenId].reputation;

        if (score > 1000) return "ELITE";
        if (score > 500) return "HIGH";
        if (score > 100) return "MEDIUM";
        return "LOW";
    }
}