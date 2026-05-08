// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimizedAllowanceManager {

    mapping(address => mapping(address => uint256))
        public allowances;

    mapping(address => mapping(bytes32 => bool))
        public permissions;

    mapping(address => mapping(address => uint256))
        public delegatedBalances;



    event AllowanceUpdated(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    event PermissionUpdated(
        address indexed user,
        bytes32 indexed permission,
        bool enabled
    );

    event DelegatedBalanceUpdated(
        address indexed owner,
        address indexed delegate,
        uint256 balance
    );



    function approve(

        address spender,

        uint256 amount

    ) external {

        allowances[msg.sender][spender]
            = amount;

        emit AllowanceUpdated(
            msg.sender,
            spender,
            amount
        );
    }



    function spendAllowance(

        address owner,

        uint256 amount

    ) external {

        uint256 currentAllowance =
            allowances[owner][msg.sender];

        require(
            currentAllowance >= amount,
            "Insufficient allowance"
        );

        uint256 updatedAllowance =
            currentAllowance - amount;

        allowances[owner][msg.sender]
            = updatedAllowance;

        emit AllowanceUpdated(
            owner,
            msg.sender,
            updatedAllowance
        );
    }



    function increaseAllowance(

        address spender,

        uint256 amount

    ) external {

        uint256 current =
            allowances[msg.sender][spender];

        uint256 updated =
            current + amount;

        allowances[msg.sender][spender]
            = updated;

        emit AllowanceUpdated(
            msg.sender,
            spender,
            updated
        );
    }



    function decreaseAllowance(

        address spender,

        uint256 amount

    ) external {

        uint256 current =
            allowances[msg.sender][spender];

        require(
            current >= amount,
            "Allowance exceeded"
        );

        uint256 updated =
            current - amount;

        allowances[msg.sender][spender]
            = updated;

        emit AllowanceUpdated(
            msg.sender,
            spender,
            updated
        );
    }



    function setPermission(

        bytes32 permission,

        bool enabled

    ) external {

        mapping(bytes32 => bool)
            storage userPermissions =
                permissions[msg.sender];

        userPermissions[permission]
            = enabled;

        emit PermissionUpdated(
            msg.sender,
            permission,
            enabled
        );
    }



    function batchPermissionUpdate(

        address user,

        bytes32[] calldata keys,

        bool enabled

    ) external {

        mapping(bytes32 => bool)
            storage userPermissions =
                permissions[user];

        uint256 length = keys.length;

        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            bytes32 key = keys[i];

            userPermissions[key]
                = enabled;

            emit PermissionUpdated(
                user,
                key,
                enabled
            );
        }
    }



    function assignDelegatedBalance(

        address delegate,

        uint256 amount

    ) external {

        mapping(address => uint256)
            storage balances =
                delegatedBalances[msg.sender];

        balances[delegate]
            = amount;

        emit DelegatedBalanceUpdated(
            msg.sender,
            delegate,
            amount
        );
    }



    function moveDelegatedBalance(

        address from,

        address to,

        uint256 amount

    ) external {

        mapping(address => uint256)
            storage balances =
                delegatedBalances[msg.sender];

        uint256 currentBalance =
            balances[from];

        require(
            currentBalance >= amount,
            "Insufficient balance"
        );

        balances[from] =
            currentBalance - amount;

        balances[to] += amount;

        emit DelegatedBalanceUpdated(
            msg.sender,
            from,
            balances[from]
        );

        emit DelegatedBalanceUpdated(
            msg.sender,
            to,
            balances[to]
        );
    }



    function consumePermissionedAllowance(

        address owner,

        bytes32 permission,

        uint256 amount

    ) external {

        mapping(bytes32 => bool)
            storage userPermissions =
                permissions[owner];

        require(
            userPermissions[permission],
            "Permission denied"
        );



        mapping(address => uint256)
            storage ownerAllowances =
                allowances[owner];

        uint256 currentAllowance =
            ownerAllowances[msg.sender];

        require(
            currentAllowance >= amount,
            "Allowance low"
        );



        uint256 updatedAllowance =
            currentAllowance - amount;

        ownerAllowances[msg.sender]
            = updatedAllowance;

        emit AllowanceUpdated(
            owner,
            msg.sender,
            updatedAllowance
        );
    }



    function revokeAllPermissions(
        address user,
        bytes32[] calldata keys
    ) external {

        mapping(bytes32 => bool)
            storage userPermissions =
                permissions[user];

        uint256 length = keys.length;

        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            bytes32 key = keys[i];

            if (userPermissions[key]) {

                userPermissions[key]
                    = false;

                emit PermissionUpdated(
                    user,
                    key,
                    false
                );
            }
        }
    }



    function getRemainingAllowance(

        address owner,

        address spender

    )
        external
        view
        returns(uint256)
    {
        return allowances[owner][spender];
    }



    function hasPermission(

        address user,

        bytes32 permission

    )
        external
        view
        returns(bool)
    {
        return permissions[user][permission];
    }



    function getDelegatedBalance(

        address owner,

        address delegate

    )
        external
        view
        returns(uint256)
    {
        return delegatedBalances[owner][delegate];
    }
}
