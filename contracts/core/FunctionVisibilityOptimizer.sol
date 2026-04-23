// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FunctionVisibilityOptimizer {
    uint256 private value;

    // external is cheaper than public for calldata
    function setValue(uint256 _value) external {
        value = _value;
    }

    function increment(uint256 _amount) external {
        value += _amount;
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    // internal function avoids unnecessary copying
    function _double(uint256 x) internal pure returns (uint256) {
        return x * 2;
    }

    function compute(uint256 x) external pure returns (uint256) {
        return _double(x);
    }
}