// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MetadataValidator {
    string public moduleTopic = "metadata validator";
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function validateJSON(string calldata json) external pure returns (bool) {
        bytes memory b = bytes(json);
        if (b.length < 2) return false;
        return (b[0] == '{' && b[b.length - 1] == '}') || (b[0] == '[' && b[b.length - 1] == ']');
    }
}
