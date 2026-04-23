// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExecutionEfficientVault {
    mapping(address => uint256) private balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        uint256 bal = balances[msg.sender]; // cache

        require(bal >= amount, "Insufficient");

        unchecked {
            balances[msg.sender] = bal - amount;
        }

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }
}