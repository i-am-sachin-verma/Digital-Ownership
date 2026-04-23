// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    FILE: CrowdfundingPlatform.sol
    ============================================================

    Topic:
    - Crowdfunding
    - Campaign creation
    - Funding & withdrawals

    Features:
    - Create campaign
    - Contribute ETH
    - Refund if failed
*/

contract CrowdfundingPlatform {

    struct Campaign {
        address creator;
        uint256 goal;
        uint256 raised;
        uint256 deadline;
        bool claimed;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    uint256 public campaignCount;

    event CampaignCreated(uint256 id, uint256 goal);
    event Funded(uint256 id, address contributor, uint256 amount);
    event Claimed(uint256 id);
    event Refunded(uint256 id, address user);

    // ============================================================
    // CREATE CAMPAIGN
    // ============================================================

    function createCampaign(uint256 goal, uint256 duration) external {
        campaignCount++;

        campaigns[campaignCount] = Campaign({
            creator: msg.sender,
            goal: goal,
            raised: 0,
            deadline: block.timestamp + duration,
            claimed: false
        });

        emit CampaignCreated(campaignCount, goal);
    }

    // ============================================================
    // FUND CAMPAIGN
    // ============================================================

    function fund(uint256 id) external payable {
        Campaign storage c = campaigns[id];

        require(block.timestamp < c.deadline, "Ended");

        c.raised += msg.value;
        contributions[id][msg.sender] += msg.value;

        emit Funded(id, msg.sender, msg.value);
    }

    // ============================================================
    // CLAIM FUNDS
    // ============================================================

    function claim(uint256 id) external {
        Campaign storage c = campaigns[id];

        require(msg.sender == c.creator, "Not creator");
        require(c.raised >= c.goal, "Goal not met");
        require(!c.claimed, "Already claimed");

        c.claimed = true;

        payable(c.creator).transfer(c.raised);

        emit Claimed(id);
    }

    // ============================================================
    // REFUND
    // ============================================================

    function refund(uint256 id) external {
        Campaign storage c = campaigns[id];

        require(block.timestamp > c.deadline, "Not ended");
        require(c.raised < c.goal, "Goal met");

        uint256 amount = contributions[id][msg.sender];
        require(amount > 0, "No funds");

        contributions[id][msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit Refunded(id, msg.sender);
    }
}