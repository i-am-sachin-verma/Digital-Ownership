// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MinimalProxy
 * @dev Implementation of a basic proxy that delegates calls to an implementation address.
 * Addressing Issue #26: Delegatecall-Based Modularization for Deployment Cost Minimization.
 */
contract MinimalProxy {
    // Storage slot for the address of the implementation contract.
    // bytes32(uint256(keccak256("proxiable.implementation")) - 1)
    bytes32 private constant IMPLEMENTATION_SLOT = 0xc5f16f0fcc639fa48a6947836d9850f5047985239322b6af35363249121544b6;

    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation");
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, _implementation)
        }
    }

    /**
     * @dev Fallback function that delegates calls to the implementation.
     */
    fallback() external payable {
        _delegate();
    }

    receive() external payable {
        _delegate();
    }

    function _delegate() internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            // Read implementation address from storage
            let _implementation := sload(slot)

            // Copy msg.data to memory
            calldatacopy(0, 0, calldatasize())

            // Forward the call to the implementation
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)

            // Copy return data
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    function getImplementation() external view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }
}
