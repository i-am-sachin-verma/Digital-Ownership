 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract AuthManager {
     mapping(address => bool) private admins;
     address public immutable owner;
     uint256 private adminCount;

     event AdminAdded(address indexed user);
     event AdminRemoved(address indexed user);

     modifier onlyAdmin() {
         require(admins[msg.sender], "Not authorized");
         _;
     }

     constructor() {
         owner = msg.sender;
         admins[msg.sender] = true;
         adminCount = 1;
     }

     function addAdmin(address user) external onlyAdmin {
         require(user != address(0), "Invalid address");
         require(!admins[user], "Already an admin");
         admins[user] = true;
         adminCount++;
         emit AdminAdded(user);
     }

     function removeAdmin(address user) external onlyAdmin {
         require(user != address(0), "Invalid address");
         require(admins[user], "Not an admin");
         require(user != owner, "Cannot remove owner");
         require(adminCount > 1, "Cannot remove last admin");
         admins[user] = false;
         adminCount--;
         emit AdminRemoved(user);
     }

     function isAdmin(address user) external view returns (bool) {
         return admins[user];
     }
 }
