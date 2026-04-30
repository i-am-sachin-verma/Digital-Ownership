// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConditionalOptimizer {

    address public owner;
    bool public paused;
    uint256 public feePercent = 2;
    uint256 public maxLimit = 100 ether;

    mapping(address => uint256) public balances;
    mapping(address => bool) public vipUsers;
    mapping(address => bool) public blacklist;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event FeeChanged(uint256 newFee);
    event PauseChanged(bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier active() {
        require(!paused, "Paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /*
        BAD STYLE EXAMPLE (nested branching)

        if (!paused) {
            if (!blacklist[user]) {
                if (amount > 0) {
                    if (amount <= maxLimit) {
                        ...
                    }
                }
            }
        }

        Better:
        Use guard clauses with early reverts
    */

    function deposit() external payable active {
        uint256 amount = msg.value;

        require(!blacklist[msg.sender], "Blacklisted");
        require(amount > 0, "Zero deposit");
        require(amount <= maxLimit, "Above max");

        balances[msg.sender] += amount;

        emit Deposited(msg.sender, amount);
    }

    /*
        Optimized branching:
        - Return early
        - Single path after validation
        - Reduced nested if trees
    */
    function withdraw(uint256 amount) external active {
        require(!blacklist[msg.sender], "Blacklisted");
        require(amount > 0, "Zero amount");

        uint256 userBalance = balances[msg.sender];
        require(userBalance >= amount, "Low balance");

        uint256 fee = _calculateFee(msg.sender, amount);
        uint256 payout = amount - fee;

        balances[msg.sender] = userBalance - amount;

        payable(msg.sender).transfer(payout);

        emit Withdrawn(msg.sender, payout);
    }

    /*
        Simplified fee logic:
        Instead of multiple nested checks
    */
    function _calculateFee(
        address user,
        uint256 amount
    ) internal view returns (uint256) {

        if (vipUsers[user]) {
            return 0;
        }

        if (amount >= 10 ether) {
            return (amount * 1) / 100;
        }

        return (amount * feePercent) / 100;
    }

    /*
        Example of branch flattening
    */
    function canTransact(address user)
        external
        view
        returns (bool)
    {
        if (paused) return false;
        if (blacklist[user]) return false;

        return true;
    }

    /*
        Another optimized path
    */
    function accountType(address user)
        external
        view
        returns (string memory)
    {
        if (blacklist[user]) return "Blocked";
        if (vipUsers[user]) return "VIP";
        if (balances[user] > 0) return "Active";

        return "Normal";
    }

    /*
        Owner functions
    */
    function setVIP(address user, bool status)
        external
        onlyOwner
    {
        vipUsers[user] = status;
    }

    function setBlacklist(address user, bool status)
        external
        onlyOwner
    {
        blacklist[user] = status;
    }

    function setFee(uint256 newFee)
        external
        onlyOwner
    {
        require(newFee <= 10, "Too high");
        feePercent = newFee;

        emit FeeChanged(newFee);
    }

    function setPause(bool status)
        external
        onlyOwner
    {
        paused = status;

        emit PauseChanged(status);
    }

    function setMaxLimit(uint256 newLimit)
        external
        onlyOwner
    {
        require(newLimit > 0, "Zero");
        maxLimit = newLimit;
    }

    /*
        Batch checker with reduced branches
    */
    function checkUsers(address[] calldata users)
        external
        view
        returns (bool[] memory result)
    {
        uint256 len = users.length;
        result = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            result[i] = !(paused || blacklist[users[i]]);
        }
    }

    receive() external payable {
        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }
}