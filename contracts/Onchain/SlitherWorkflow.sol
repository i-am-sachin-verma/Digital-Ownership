// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SlitherWorkflow {
    string public moduleTopic = "slither workflow";
    address public admin;
    bool public slitherEnabled = true;

    constructor() {
        admin = msg.sender;
    }

    function toggleSlither() external {
        require(msg.sender == admin, "Only admin");
        slitherEnabled = !slitherEnabled;
    }
}
