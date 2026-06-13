// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GraphPaginationEngine {
    string public moduleTopic = "graph pagination";
    address public admin;

    uint256[] public itemIds;
    mapping(uint256 => string) public items;

    constructor() {
        admin = msg.sender;
    }

    function addItem(uint256 id, string calldata data) external {
        items[id] = data;
        itemIds.push(id);
    }

    function getPaginatedItems(uint256 offset, uint256 limit) external view returns (string[] memory) {
        uint256 total = itemIds.length;
        if (offset >= total) {
            return new string[](0);
        }
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        string[] memory page = new string[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = items[itemIds[i]];
        }
        return page;
    }
}
