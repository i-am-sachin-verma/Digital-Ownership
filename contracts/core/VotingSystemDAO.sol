// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    FILE: VotingSystemDAO.sol
    ============================================================

    Topic:
    - DAO Governance
    - Proposal creation and voting
    - Majority decision logic

    Features:
    - Create proposals
    - Vote (yes/no)
    - Prevent double voting
    - Execute proposals
*/

contract VotingSystemDAO {

    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCount;

    event ProposalCreated(uint256 id, string description);
    event Voted(uint256 id, address voter, bool support);
    event Executed(uint256 id, bool passed);

    // ============================================================
    // CREATE PROPOSAL
    // ============================================================

    function createProposal(string calldata description, uint256 duration) external {
        proposalCount++;

        proposals[proposalCount] = Proposal({
            description: description,
            yesVotes: 0,
            noVotes: 0,
            deadline: block.timestamp + duration,
            executed: false
        });

        emit ProposalCreated(proposalCount, description);
    }

    // ============================================================
    // VOTE
    // ============================================================

    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];

        require(block.timestamp < p.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    // ============================================================
    // EXECUTE PROPOSAL
    // ============================================================

    function execute(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];

        require(block.timestamp >= p.deadline, "Voting not ended");
        require(!p.executed, "Already executed");

        p.executed = true;

        bool passed = p.yesVotes > p.noVotes;

        emit Executed(proposalId, passed);
    }

    // ============================================================
    // VIEW RESULT
    // ============================================================

    function getResult(uint256 proposalId) external view returns (string memory result) {
        Proposal storage p = proposals[proposalId];

        if (block.timestamp < p.deadline) {
            return "Voting in progress";
        }

        if (p.yesVotes > p.noVotes) {
            return "Passed";
        } else {
            return "Rejected";
        }
    }
}