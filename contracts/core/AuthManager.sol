 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract AuthManager {
     mapping(address => bool) private admins;

     event AdminAdded(address indexed user);
     event AdminRemoved(address indexed user);

     modifier onlyAdmin() {
         require(admins[msg.sender], "Not authorized");
         _;
     }

     constructor() {
         admins[msg.sender] = true;
     }

     function addAdmin(address user) external onlyAdmin {
         require(user != address(0), "Invalid address");
         admins[user] = true;
         emit AdminAdded(user);
     }

     function removeAdmin(address user) external onlyAdmin {
         admins[user] = false;
         emit AdminRemoved(user);
     }

     function isAdmin(address user) external view returns (bool) {
         return admins[user];
     }
 }
