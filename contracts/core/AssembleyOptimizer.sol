// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssemblyOptimizer {

    address public owner;
    uint256 public totalValue;

    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /*
        Normal deposit path
    */
    function deposit() external payable {
        require(msg.value > 0, "Zero");

        balances[msg.sender] += msg.value;
        totalValue += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /*
        Assembly optimized add

        Faster than some high level patterns
    */
    function addFast(
        uint256 a,
        uint256 b
    ) external pure returns (uint256 result) {

        assembly {
            result := add(a, b)
        }
    }

    /*
        Assembly optimized max
    */
    function maxFast(
        uint256 a,
        uint256 b
    ) external pure returns (uint256 result) {

        assembly {
            switch gt(a, b)
            case 1 { result := a }
            default { result := b }
        }
    }

    /*
        Efficient check for zero address
    */
    function isZeroAddress(
        address user
    ) external pure returns (bool ok) {

        assembly {
            ok := iszero(user)
        }
    }

    /*
        Gas optimized withdraw path
        Uses assembly for transfer call
    */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Zero");
        require(balances[msg.sender] >= amount, "Low");

        balances[msg.sender] -= amount;
        totalValue -= amount;

        address to = msg.sender;

        assembly {
            let success := call(
                gas(),
                to,
                amount,
                0,
                0,
                0,
                0
            )

            if iszero(success) {
                revert(0, 0)
            }
        }

        emit Withdrawn(msg.sender, amount);
    }

    /*
        Sum array with Yul loop
    */
    function sumArray(
        uint256[] calldata arr
    ) external pure returns (uint256 total) {

        assembly {
            let len := arr.length
            let offset := arr.offset
            let end := add(offset, mul(len, 0x20))

            for {

            } lt(offset, end) {

                offset := add(offset, 0x20)

            } {
                total := add(total, calldataload(offset))
            }
        }
    }

    /*
        Read contract ETH balance with assembly
    */
    function contractBalance()
        external
        view
        returns (uint256 bal)
    {
        assembly {
            bal := selfbalance()
        }
    }

    /*
        Efficient owner change
    */
    function transferOwnership(
        address newOwner
    ) external onlyOwner {

        require(newOwner != address(0), "Zero");

        assembly {
            sstore(owner.slot, newOwner)
        }
    }

    /*
        Storage read through assembly
    */
    function getOwner()
        external
        view
        returns (address current)
    {
        assembly {
            current := sload(owner.slot)
        }
    }
}