// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Validator {
    function validateString(string memory input) internal pure {
        require(bytes(input).length > 0, "Invalid: empty string");
        require(bytes(input).length <= 256, "Too long");
    }

    function validateAddress(address addr) internal pure {
        require(addr != address(0), "Zero address not allowed");
    }
}