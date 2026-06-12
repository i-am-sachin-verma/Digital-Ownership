// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Create2Factory {
    string public moduleTopic = "CREATE2 Deployer";
    address public admin;

    event Deployed(address indexed addr, bytes32 indexed salt);

    constructor() {
        admin = msg.sender;
    }

    function deploy(bytes memory bytecode, bytes32 salt) public returns (address) {
        require(bytecode.length > 0, "Create2Factory: bytecode length is zero");
        address addr;
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr, salt);
        return addr;
    }

    function computeAddress(bytes memory bytecode, bytes32 salt) public view returns (address) {
        bytes32 bytecodeHash = keccak256(bytecode);
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            bytecodeHash
        )))));
    }
}
