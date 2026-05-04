// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * TrustScoreStorage.sol
 * ----------------------------------------------------
 * Stores all data required for multi-layer trust scoring.
 *
 * DESIGN GOALS:
 * - Gas efficient
 * - Modular
 * - Extendable for off-chain integration
 */

contract TrustScoreStorage {

    // =========================
    // CORE STRUCTURES
    // =========================

    struct Identity {
        uint256 createdAt;        // identity age
        uint256 endorsements;     // total endorsements
        uint256 baseScore;        // direct score
        uint256 reputation;       // final trust score
        bool exists;
    }

    // tokenId => identity data
    mapping(uint256 => Identity) public identities;

    // endorsement weights: from -> to -> weight
    mapping(uint256 => mapping(uint256 => uint256)) public endorsementWeight;

    // who endorsed whom
    mapping(uint256 => uint256[]) internal incoming;

    // anti-sybil penalty
    mapping(uint256 => uint256) public penaltyScore;

    // =========================
    // CONFIGURABLE PARAMETERS
    // =========================

    uint256 public constant BASE_ENDORSEMENT_SCORE = 10;
    uint256 public constant MAX_WEIGHT = 100;
    uint256 public constant AGE_FACTOR_DIVISOR = 1 days;

    // diminishing returns
    uint256 public constant DIMINISHING_FACTOR = 2;

    // =========================
    // EVENTS
    // =========================

    event IdentityCreated(uint256 tokenId);
    event Endorsed(uint256 from, uint256 to, uint256 weight);
    event ScoreUpdated(uint256 tokenId, uint256 score);
}