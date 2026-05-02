// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EventOptimizer {

    address public owner;
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;

    mapping(address => uint256) public balances;
    mapping(address => bool) public whitelist;

    /*
        Optimized Event Strategy

        Instead of:
        - emitting on every internal state change
        - many tiny duplicate logs
        - unnecessary verbose data

        Use:
        - only external user-facing actions
        - indexed searchable fields
        - compact parameters
    */

    // Essential user action logs
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    // Important admin changes only
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );

    event WhitelistUpdated(
        address indexed user,
        bool status
    );

    event EmergencyWithdraw(
        address indexed owner,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /*
        Good:
        Emit once after success

        Avoid:
        emit BeforeDeposit(...)
        emit DepositStarted(...)
        emit DepositDone(...)
    */
    function deposit() external payable {
        require(msg.value > 0, "Zero amount");

        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    /*
        Emit only final successful result
    */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Zero");
        require(balances[msg.sender] >= amount, "Low balance");

        balances[msg.sender] -= amount;
        totalWithdrawals += amount;

        payable(msg.sender).transfer(amount);

        emit Withdraw(msg.sender, amount);
    }

    /*
        No event needed here.
        Pure read functions should not log.
    */
    function myBalance()
        external
        view
        returns (uint256)
    {
        return balances[msg.sender];
    }

    /*
        Emit only if actual state changed
        Prevent useless duplicate logs
    */
    function setWhitelist(
        address user,
        bool status
    ) external onlyOwner {

        require(
            whitelist[user] != status,
            "No change"
        );

        whitelist[user] = status;

        emit WhitelistUpdated(user, status);
    }

    /*
        Emit only when ownership changes
    */
    function transferOwnership(
        address newOwner
    ) external onlyOwner {

        require(newOwner != address(0), "Zero");
        require(newOwner != owner, "Same owner");

        address old = owner;
        owner = newOwner;

        emit OwnershipTransferred(
            old,
            newOwner
        );
    }

    /*
        Important one-time critical event
    */
    function emergencyWithdraw()
        external
        onlyOwner
    {
        uint256 amount = address(this).balance;

        payable(owner).transfer(amount);

        emit EmergencyWithdraw(
            owner,
            amount
        );
    }

    /*
        Batch action:
        single summary event is cheaper than many logs
    */
    event BatchCredit(
        uint256 users,
        uint256 totalAmount
    );

    function batchCredit(
        address[] calldata users,
        uint256 amount
    ) external onlyOwner {

        require(amount > 0, "Zero");

        uint256 len = users.length;
        uint256 total;

        for (uint256 i = 0; i < len; i++) {
            balances[users[i]] += amount;
            total += amount;
        }

        emit BatchCredit(len, total);
    }

    /*
        Optional stats helper
    */
    function contractBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
        totalDeposits += msg.value;

        emit Deposit(msg.sender, msg.value);
    }
}