// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    Contract: MinimalProxyPattern
    ============================================================

    Purpose:
    --------
    Demonstrates deployment cost reduction using proxy pattern.

    Core Idea:
    ----------
    Instead of deploying full contracts repeatedly:
    → deploy ONE implementation
    → use proxies to delegate calls

    Benefits:
    ---------
    - Massive deployment gas savings
    - Code reuse
    - Upgrade flexibility

    ============================================================
*/

/*
    ------------------------------------------------------------
    IMPLEMENTATION CONTRACT
    ------------------------------------------------------------
*/
contract Implementation {

    // Example storage variable
    uint256 public value;

    /*
        Simple setter function
        This logic will be reused via proxy
    */
    function setValue(uint256 _value) external {
        value = _value;
    }
}

/*
    ------------------------------------------------------------
    PROXY CONTRACT
    ------------------------------------------------------------
*/
contract MinimalProxyPattern {

    /*
        Address of implementation contract
        All calls will be forwarded here
    */
    address public implementation;

    /*
        Constructor sets implementation
    */
    constructor(address _impl) {
        implementation = _impl;
    }

    /*
        --------------------------------------------------------
        FALLBACK FUNCTION
        --------------------------------------------------------

        This is where magic happens.

        Steps:
        ------
        1. Copy calldata
        2. Delegatecall to implementation
        3. Return result

        delegatecall:
        -------------
        - Uses caller storage
        - Executes implementation code

    */
    fallback() external payable {

        address impl = implementation;

        assembly {

            /*
                Copy incoming call data
            */
            calldatacopy(0, 0, calldatasize())

            /*
                Delegate call to implementation
            */
            let result := delegatecall(
                gas(),         // forward all gas
                impl,          // target contract
                0,             // input location
                calldatasize(),// input size
                0,             // output location
                0              // output size
            )

            /*
                Copy returned data
            */
            returndatacopy(0, 0, returndatasize())

            /*
                Handle success / failure
            */
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}