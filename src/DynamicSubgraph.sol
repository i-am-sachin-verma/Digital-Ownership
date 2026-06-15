// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DynamicSubgraph {
    string public moduleTopic = "subgraph indexing";
    address public admin;

    struct Record {
        uint256 id;
        string data;
        address owner;
        uint256 createdAt;
    }

    uint256[] public recordIds;
    mapping(uint256 => Record) public records;

    event RecordCreated(uint256 indexed id, address indexed owner);
    event RecordDeleted(uint256 indexed id);

    constructor() {
        admin = msg.sender;
    }

    function setRecord(uint256 id, string memory data) public {
        if (records[id].owner == address(0)) {
            recordIds.push(id);
        }
        records[id] = Record({
            id: id,
            data: data,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        emit RecordCreated(id, msg.sender);
    }

    function getRecords(uint256 offset, uint256 limit) public view returns (Record[] memory) {
        uint256 total = recordIds.length;
        if (offset >= total) return new Record[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        Record[] memory items = new Record[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            items[i - offset] = records[recordIds[i]];
        }
        return items;
    }
}
