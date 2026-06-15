// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MetadataCleaner {
    string public moduleTopic = "metadata cleaner";
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function cleanMetadata(string calldata dirty) external pure returns (string memory) {
        bytes memory bDirty = bytes(dirty);
        uint256 cleanCount = 0;
        for (uint256 i = 0; i < bDirty.length; i++) {
            if (bDirty[i] != 0x00) {
                cleanCount++;
            }
        }
        bytes memory bClean = new bytes(cleanCount);
        uint256 index = 0;
        for (uint256 i = 0; i < bDirty.length; i++) {
            if (bDirty[i] != 0x00) {
                bClean[index] = bDirty[i];
                index++;
            }
        }
        return string(bClean);
    }
}
