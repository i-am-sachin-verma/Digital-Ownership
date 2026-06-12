// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DAOExecutor {
    string public moduleTopic = "DAO governance";
    address public admin;
    uint256 public delay = 2 days;
    uint256 public constant MIN_DELAY = 1 hours;
    uint256 public constant MAX_DELAY = 30 days;

    mapping(bytes32 => bool) public queuedTransactions;

    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event CancelTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event NewDelay(uint256 indexed newDelay);
    event NewAdmin(address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "DAOExecutor: Call must come from admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setDelay(uint256 newDelay) public onlyAdmin {
        require(newDelay >= MIN_DELAY && newDelay <= MAX_DELAY, "DAOExecutor: Delay must be within limits");
        delay = newDelay;
        emit NewDelay(newDelay);
    }

    function setAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "DAOExecutor: Invalid address");
        admin = newAdmin;
        emit NewAdmin(newAdmin);
    }

    function queueTransaction(address target, uint256 value, string memory signature, bytes memory data, uint256 eta) public onlyAdmin returns (bytes32) {
        require(eta >= block.timestamp + delay, "DAOExecutor: Estimated execution block must satisfy delay");
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;
        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    function executeTransaction(address target, uint256 value, string memory signature, bytes memory data, uint256 eta) public payable onlyAdmin returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        require(queuedTransactions[txHash], "DAOExecutor: Transaction hasn't been queued");
        require(block.timestamp >= eta, "DAOExecutor: Transaction hasn't surpassed ETA");
        require(block.timestamp <= eta + 14 days, "DAOExecutor: Transaction is stale");

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "DAOExecutor: Transaction execution reverted");

        emit ExecuteTransaction(txHash, target, value, signature, data, eta);
        return returnData;
    }

    function cancelTransaction(address target, uint256 value, string memory signature, bytes memory data, uint256 eta) public onlyAdmin {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        require(queuedTransactions[txHash], "DAOExecutor: Transaction hasn't been queued");
        queuedTransactions[txHash] = false;
        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }
}
