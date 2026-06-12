// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IPFSStorageBridge {
    string public moduleTopic = "IPFS Storage Bridge";
    address public admin;

    struct IPFSFile {
        string ipfsHash;
        bool encrypted;
        bytes32 encryptionKeyHash;
    }

    mapping(address => IPFSFile[]) public userFiles;

    constructor() {
        admin = msg.sender;
    }

    function storeFile(string calldata ipfsHash, bool encrypted, bytes32 keyHash) external {
        userFiles[msg.sender].push(IPFSFile({
            ipfsHash: ipfsHash,
            encrypted: encrypted,
            encryptionKeyHash: keyHash
        }));
    }
}
