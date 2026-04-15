 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 interface IAuth {
     function isAdmin(address user) external view returns (bool);
 }
