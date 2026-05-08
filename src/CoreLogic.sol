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
        require(id > 0, "ID must be greater than zero");
        require(bytes(value).length > 0, "Value cannot be empty");

        data[id] = value;
        emit DataUpdated(id, value);
    }

    function getData(uint256 id) external view returns (string memory) {
        require(id > 0, "ID must be greater than zero");
        string memory value = data[id];
        require(bytes(value).length > 0, "Data not found for this ID");
        return value;
    }
}