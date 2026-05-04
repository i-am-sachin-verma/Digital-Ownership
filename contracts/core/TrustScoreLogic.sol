// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TrustScoreStorage.sol";

/**
 * TrustScoreLogic.sol
 * ----------------------------------------------------
 * Implements:
 * - Multi-layer trust scoring
 * - Sybil resistance via:
 *   -> weighted endorsements
 *   -> diminishing returns
 *   -> identity age factor
 */

contract TrustScoreLogic is TrustScoreStorage {

    /**
     * Create identity
     */
    function createIdentity(uint256 tokenId) external {
        require(!identities[tokenId].exists, "Already exists");

        identities[tokenId] = Identity({
            createdAt: block.timestamp,
            endorsements: 0,
            baseScore: 0,
            reputation: 0,
            exists: true
        });

        emit IdentityCreated(tokenId);
    }

    /**
     * Add endorsement
     */
    function endorse(uint256 from, uint256 to, uint256 weight) external {
        require(from != to, "Self endorsement");
        require(identities[from].exists && identities[to].exists, "Invalid identity");
        require(weight <= MAX_WEIGHT, "Weight too high");

        endorsementWeight[from][to] = weight;
        incoming[to].push(from);

        identities[to].endorsements++;

        emit Endorsed(from, to, weight);
    }

    /**
     * Compute trust score (multi-layer)
     */
    function computeScore(uint256 tokenId) public view returns (uint256) {
        Identity memory id = identities[tokenId];

        uint256 score = 0;

        // =========================
        // LAYER 1: DIRECT ENDORSEMENTS
        // =========================

        uint256[] memory endorsers = incoming[tokenId];

        for (uint256 i = 0; i < endorsers.length; i++) {
            uint256 from = endorsers[i];

            uint256 weight = endorsementWeight[from][tokenId];

            // =========================
            // LAYER 2: ENDORSER CREDIBILITY
            // =========================
            uint256 credibility = identities[from].reputation;

            if (credibility == 0) credibility = 1;

            uint256 contribution = (weight * credibility) / 100;

            // =========================
            // LAYER 3: DIMINISHING RETURNS
            // =========================
            contribution = contribution / (i + DIMINISHING_FACTOR);

            score += contribution;
        }

        // =========================
        // LAYER 4: IDENTITY AGE FACTOR
        // =========================
        uint256 age = block.timestamp - id.createdAt;
        uint256 ageBoost = age / AGE_FACTOR_DIVISOR;

        score += ageBoost;

        // =========================
        // LAYER 5: PENALTY (ANTI-SYBIL)
        // =========================
        if (penaltyScore[tokenId] > score) {
            score = 0;
        } else {
            score -= penaltyScore[tokenId];
        }

        return score;
    }
}