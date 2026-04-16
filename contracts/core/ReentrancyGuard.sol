// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract ReentrancyGuard {
    uint256 private _status;

    modifier nonReentrant() {
        require(_status == 0, "Reentrancy detected");
        _status = 1;
        _;
        _status = 0;
    }
}