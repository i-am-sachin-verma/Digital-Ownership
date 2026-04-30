// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAssemblyOptimizer {

    // Public state variable getters
    function owner() external view returns (address);

    function totalValue() external view returns (uint256);

    function balances(address user)
        external
        view
        returns (uint256);

    // Core payable functions
    function deposit() external payable;

    function withdraw(uint256 amount) external;

    // Math optimized functions
    function addFast(
        uint256 a,
        uint256 b
    ) external pure returns (uint256);

    function maxFast(
        uint256 a,
        uint256 b
    ) external pure returns (uint256);

    function doubleFast(
        uint256 x
    ) external pure returns (uint256);

    function halfFast(
        uint256 x
    ) external pure returns (uint256);

    // Utility checks
    function isZeroAddress(
        address user
    ) external pure returns (bool);

    // Array helper
    function sumArray(
        uint256[] calldata arr
    ) external pure returns (uint256);

    // Ownership functions
    function transferOwnership(
        address newOwner
    ) external;

    function getOwner()
        external
        view
        returns (address);

    // Balance helper
    function contractBalance()
        external
        view
        returns (uint256);
}