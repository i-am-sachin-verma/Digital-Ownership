// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {

    address public owner;
    uint256 public totalBankBalance;

    mapping(address => uint256) public balances;
    mapping(address => bool) public registered;

    address[] public users;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OwnershipTransferred(address oldOwner, address newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Zero deposit");

        if (!registered[msg.sender]) {
            registered[msg.sender] = true;
            users.push(msg.sender);
        }

        balances[msg.sender] += msg.value;
        totalBankBalance += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(amount > 0, "Zero amount");
        require(balances[msg.sender] >= amount, "Low balance");

        balances[msg.sender] -= amount;
        totalBankBalance -= amount;

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function myBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function userCount() public view returns (uint256) {
        return users.length;
    }

    function getUser(uint256 index) public view returns (address) {
        return users[index];
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Zero address");

        address old = owner;
        owner = newOwner;

        emit OwnershipTransferred(old, newOwner);
    }

    function emergencyWithdrawAll() public onlyOwner {
        uint256 amount = address(this).balance;
        totalBankBalance = 0;
        payable(owner).transfer(amount);
    }

    receive() external payable {
        deposit();
    }
}