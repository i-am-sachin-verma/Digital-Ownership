// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GraphRenderer {
    string public moduleTopic = "graph renderer";
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function renderNodeSVG(uint256 id, string calldata label) external pure returns (string memory) {
        return string(abi.encodePacked(
            "<svg width='100' height='100'><circle cx='50' cy='50' r='40' fill='blue'/><text x='50' y='55' font-size='12' text-anchor='middle' fill='white'>",
            label,
            "</text></svg>"
        ));
    }
}
