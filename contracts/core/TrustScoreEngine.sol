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

    // Owner for access control
    address public owner;

    // Maximum batch size to prevent DoS via unbounded gas consumption
    uint256 public constant MAX_BATCH_SIZE = 200;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == antiCollusionContract,
            "Only authorized callers can execute this function"
        );
        _;
    }

    /**
     * Set external anti-collusion contract (restricted to owner)
     * Prevents unauthorized replacement of anti-collusion module
     */
    function setAntiCollusion(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid contract address");
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
     * Batch update with bounded array length (gas optimized for multiple identities)
     * Prevents DoS attacks via unbounded calldata array iteration
     */
    function batchUpdate(uint256[] calldata tokenIds) external onlyAuthorized {
        require(tokenIds.length > 0, "Empty batch not allowed");
        require(
            tokenIds.length <= MAX_BATCH_SIZE,
            "Batch size exceeds maximum allowed"
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 score = computeScore(tokenIds[i]);
            identities[tokenIds[i]].reputation = score;

            emit ScoreUpdated(tokenIds[i], score);
        }
    }

    /**
     * Apply manual penalty (restricted to authorized callers)
     * Prevents arbitrary penalty inflation by unauthorized addresses
     */
    function applyPenalty(uint256 tokenId, uint256 penalty) external onlyAuthorized {
        require(penalty > 0, "Penalty must be greater than zero");
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