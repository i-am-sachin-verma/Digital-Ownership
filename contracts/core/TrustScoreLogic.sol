// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TrustScoreStorage.sol";

abstract contract TrustScoreLogic is TrustScoreStorage {
    function computeScore(uint256 tokenId) public view returns (uint256) {
        Identity memory id = identities[tokenId];
        if (!id.exists) return 0;

        uint256 age = (block.timestamp - id.createdAt) / AGE_FACTOR_DIVISOR;
        uint256 endorsements = id.endorsements;
        
        uint256 diminishingEndorsements = endorsements / DIMINISHING_FACTOR;
        uint256 base = id.baseScore;
        
        uint256 penalty = penaltyScore[tokenId];
        uint256 score = base + (diminishingEndorsements * BASE_ENDORSEMENT_SCORE) + age;

        if (score > penalty) {
            unchecked {
                score -= penalty;
            }
        } else {
            score = 0;
        }

        return score > MAX_WEIGHT ? MAX_WEIGHT : score;
    }
}
