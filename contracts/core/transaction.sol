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
        require(amount > 0, "Zero withdrawal");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        totalBankBalance -= amount;

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    receive() external payable {
        deposit();
    }
}