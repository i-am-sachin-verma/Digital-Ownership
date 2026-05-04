// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * AntiCollusionStorage.sol
 * ----------------------------------------------------
 * Stores endorsement graph and metadata required
 * for anti-collusion detection.
 *
 * NOTE:
 * - We DO NOT store full graph traversal logic here (gas heavy)
 * - Instead, we store enough structure for:
 *   -> local cycle detection
 *   -> cluster density calculation
 *   -> trust penalization
 */

contract AntiCollusionStorage {

    // =========================
    // GRAPH STORAGE
    // =========================

    // Outgoing edges: A -> [B, C]
    mapping(uint256 => uint256[]) internal outgoing;

    // Incoming edges: B -> [A, D]
    mapping(uint256 => uint256[]) internal incoming;

    // Quick lookup: A -> B exists?
    mapping(uint256 => mapping(uint256 => bool)) internal hasEdge;

    // =========================
    // METADATA
    // =========================

    // Track endorsements count
    mapping(uint256 => uint256) public endorsementCount;

    // Track suspicious score
    mapping(uint256 => uint256) public suspicionScore;

    // Penalized flag
    mapping(uint256 => bool) public penalized;

    // Thresholds (tunable)
    uint256 public constant MAX_LOCAL_CYCLE_DEPTH = 3;
    uint256 public constant CLUSTER_DENSITY_THRESHOLD = 70; // %

    // =========================
    // EVENTS
    // =========================

    event EdgeAdded(uint256 from, uint256 to);
    event SuspiciousActivity(uint256 tokenId, uint256 score);
    event Penalized(uint256 tokenId);
}