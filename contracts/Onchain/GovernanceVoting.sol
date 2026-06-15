// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GovernanceVoting {
    string public moduleTopic = "governance voting";
    address public admin;
    uint256 public quorumPercentage = 4; // 4% default

    struct Proposal {
        uint256 id;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 endBlock;
        bool executed;
    }

    Proposal[] public proposals;

    event ProposalCreated(uint256 indexed id, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    constructor() {
        admin = msg.sender;
    }

    function createProposal(string calldata description, uint256 durationBlocks) external {
        proposals.push(Proposal({
            id: proposals.length,
            description: description,
            forVotes: 0,
            againstVotes: 0,
            endBlock: block.number + durationBlocks,
            executed: false
        }));
        emit ProposalCreated(proposals.length - 1, description);
    }

    function vote(uint256 proposalId, bool support, uint256 weight) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.number <= proposal.endBlock, "Voting ended");
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        emit Voted(proposalId, msg.sender, support, weight);
    }
}
