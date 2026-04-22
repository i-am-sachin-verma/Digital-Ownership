// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

contract CoreLogic is AccessController {

    mapping(uint256 => string) private data;

    event DataUpdated(uint256 indexed id, string value);

    constructor(address registryAddress) 
        AccessController(registryAddress) 
    {}

    function setData(uint256 id, string calldata value) 
        external 
        onlyVerifiedUser 
    {
        require(bytes(value).length > 0, "Empty value");

        data[id] = value;
        emit DataUpdated(id, value);
    }

    function getData(uint256 id) external view returns (string memory) {
        return data[id];
    }
}