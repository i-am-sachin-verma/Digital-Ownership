// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UpgradeableStorage {
    string public moduleTopic = "upgradeable storage";
    address public admin;
    uint256[50] private __gap;

    constructor() {
        admin = msg.sender;
    }
}
