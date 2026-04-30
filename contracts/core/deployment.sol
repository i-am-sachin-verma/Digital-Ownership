// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    Proxy Pattern using delegatecall

    Goal:
    - Cheap deployments
    - Reuse logic contract
    - Upgrade implementation later
    - Preserve storage in proxy
*/

contract StorageProxy {

    // Admin who controls upgrades
    address public admin;

    // Current logic contract
    address public implementation;

    // Example storage variables
    uint256 public number;
    string public text;
    address public lastCaller;

    event ImplementationChanged(address oldImpl, address newImpl);
    event AdminChanged(address oldAdmin, address newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _implementation) {
        admin = msg.sender;
        implementation = _implementation;
    }

    function upgrade(address newImplementation) external onlyAdmin {
        require(newImplementation != address(0), "Zero address");

        address old = implementation;
        implementation = newImplementation;

        emit ImplementationChanged(old, newImplementation);
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero address");

        address old = admin;
        admin = newAdmin;

        emit AdminChanged(old, newAdmin);
    }

    fallback() external payable {
        address impl = implementation;

        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(
                gas(),
                impl,
                0,
                calldatasize(),
                0,
                0
            )

            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {}
}


/*
    Logic V1

    Storage layout MUST match proxy storage
*/

contract LogicV1 {

    address public admin;
    address public implementation;

    uint256 public number;
    string public text;
    address public lastCaller;

    event NumberUpdated(uint256 newValue);
    event TextUpdated(string newText);

    function setNumber(uint256 _num) external {
        number = _num;
        lastCaller = msg.sender;

        emit NumberUpdated(_num);
    }

    function setText(string memory _text) external {
        text = _text;
        lastCaller = msg.sender;

        emit TextUpdated(_text);
    }

    function getData()
        external
        view
        returns (
            uint256,
            string memory,
            address
        )
    {
        return (number, text, lastCaller);
    }
}


/*
    Logic V2 (Upgradeable version)
*/

contract LogicV2 {

    address public admin;
    address public implementation;

    uint256 public number;
    string public text;
    address public lastCaller;

    event NumberUpdated(uint256 newValue);

    function setNumber(uint256 _num) external {
        number = _num * 10; // new upgraded behavior
        lastCaller = msg.sender;

        emit NumberUpdated(number);
    }

    function increment() external {
        number += 1;
        lastCaller = msg.sender;
    }

    function reset() external {
        number = 0;
        lastCaller = msg.sender;
    }

    function getNumber() external view returns (uint256) {
        return number;
    }
}