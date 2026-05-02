// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {

    // Unsigned integer stores positive values only
    uint256 public favoriteNumber;

    // Owner wallet address
    address public owner;

    // Stores text
    string public ownerName;

    // Contract pause status
    bool public paused;

    // Struct groups multiple fields together
    struct Person {
        string name;
        uint256 age;
        address wallet;
    }

    // Dynamic array of Person
    Person[] public people;

    // Mapping user => stored number
    mapping(address => uint256) public userNumbers;

    // Mapping user => name
    mapping(address => string) public userNames;

    // Events help frontend track actions
    event NumberStored(address indexed user, uint256 number);
    event PersonAdded(string name, uint256 age, address wallet);
    event PauseChanged(bool status);

    // Restrict only owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Restrict when paused
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor(string memory _name) {
        owner = msg.sender;
        ownerName = _name;
        paused = false;
    }

    // Save number globally + personally
    function store(uint256 _number) public whenNotPaused {
        favoriteNumber = _number;
        userNumbers[msg.sender] = _number;

        emit NumberStored(msg.sender, _number);
    }

    // Read number
    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }

    // Add new person
    function addPerson(
        string memory _name,
        uint256 _age
    ) public whenNotPaused {

        people.push(
            Person({
                name: _name,
                age: _age,
                wallet: msg.sender
            })
        );

        userNames[msg.sender] = _name;

        emit PersonAdded(_name, _age, msg.sender);
    }

    // Get person by index
    function getPerson(uint256 index)
        public
        view
        returns (
            string memory,
            uint256,
            address
        )
    {
        Person memory p = people[index];
        return (p.name, p.age, p.wallet);
    }

    // Total people count
    function totalPeople() public view returns (uint256) {
        return people.length;
    }

    // Pause contract
    function pause() public onlyOwner {
        paused = true;
        emit PauseChanged(true);
    }

    // Unpause contract
    function unpause() public onlyOwner {
        paused = false;
        emit PauseChanged(false);
    }

    // Change owner name
    function updateOwnerName(
        string memory _newName
    ) public onlyOwner {
        ownerName = _newName;
    }

    // Check if caller has saved number
    function myNumber() public view returns (uint256) {
        return userNumbers[msg.sender];
    }

    // Check if caller has saved name
    function myName() public view returns (string memory) {
        return userNames[msg.sender];
    }

    // Reset global number
    function resetNumber() public onlyOwner {
        favoriteNumber = 0;
    }

    // Transfer ownership
    function transferOwnership(address newOwner)
        public
        onlyOwner
    {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}