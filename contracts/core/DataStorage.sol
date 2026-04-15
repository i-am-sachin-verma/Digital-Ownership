 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract DataStorage {
     mapping(uint256 => string) internal data;

     function _setData(uint256 id, string memory value) internal {
         data[id] = value;
     }

     function getData(uint256 id) external view returns (string memory) {
         return data[id];
     }
 }
