// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FuzzHarness {
    string public moduleTopic = "Fuzz Harness";
    address public admin;
    uint256 public totalSupplied;
    mapping(address => uint256) public balances;

    constructor() {
        admin = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        totalSupplied += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalSupplied -= amount;
        payable(msg.sender).transfer(amount);
    }

    function checkInvariant() public view returns (bool) {
        return address(this).balance == totalSupplied;
    }
}
