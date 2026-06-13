// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CIDIntegrityChecker {
    string public moduleTopic = "CID Integrity Check";
    address public admin;

    struct CIDRecord {
        string cid;
        bytes32 multihash;
        uint8 hashType; // 1 = SHA256, 2 = BLAKE2b
        uint256 timestamp;
    }

    mapping(string => CIDRecord) public records;

    event CIDRegistered(string cid, bytes32 multihash, uint8 hashType);

    constructor() {
        admin = msg.sender;
    }

    function registerCID(string calldata cid, bytes32 multihash, uint8 hashType) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(multihash != bytes32(0), "Invalid multihash");
        require(hashType == 1 || hashType == 2, "Unsupported hash type");

        records[cid] = CIDRecord({
            cid: cid,
            multihash: multihash,
            hashType: hashType,
            timestamp: block.timestamp
        });

        emit CIDRegistered(cid, multihash, hashType);
    }
}
