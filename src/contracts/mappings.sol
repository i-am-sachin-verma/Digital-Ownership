// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimizedNestedMappings {

    mapping(address => mapping(address => uint256))
        public allowances;

    mapping(address => mapping(bytes32 => bool))
        public permissions;

    mapping(address => mapping(uint256 => uint256))
        public dailyLimits;

    mapping(address => mapping(address => uint256))
        public delegatedVotes;



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

    event DailyLimitUpdated(
        address indexed user,
        uint256 indexed day,
        uint256 limit
    );

    event DelegatedVoteUpdated(
        address indexed owner,
        address indexed delegate,
        uint256 votes
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
            "Underflow"
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

        permissions[msg.sender][permission]
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

        bool value

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

            userPermissions[key] = value;

            emit PermissionUpdated(
                user,
                key,
                value
            );
        }
    }



    function updateDailyLimit(

        uint256 day,

        uint256 limit

    ) external {

        mapping(uint256 => uint256)
            storage userLimits =
                dailyLimits[msg.sender];

        userLimits[day] = limit;

        emit DailyLimitUpdated(
            msg.sender,
            day,
            limit
        );
    }



    function increaseDailyLimit(

        uint256 day,

        uint256 amount

    ) external {

        mapping(uint256 => uint256)
            storage userLimits =
                dailyLimits[msg.sender];

        uint256 current =
            userLimits[day];

        uint256 updated =
            current + amount;

        userLimits[day] = updated;

        emit DailyLimitUpdated(
            msg.sender,
            day,
            updated
        );
    }



    function reduceDailyLimit(

        uint256 day,

        uint256 amount

    ) external {

        mapping(uint256 => uint256)
            storage userLimits =
                dailyLimits[msg.sender];

        uint256 current =
            userLimits[day];

        require(
            current >= amount,
            "Limit exceeded"
        );

        uint256 updated =
            current - amount;

        userLimits[day] = updated;

        emit DailyLimitUpdated(
            msg.sender,
            day,
            updated
        );
    }



    function delegateVotes(

        address delegate,

        uint256 votes

    ) external {

        delegatedVotes[msg.sender][delegate]
            = votes;

        emit DelegatedVoteUpdated(
            msg.sender,
            delegate,
            votes
        );
    }



    function moveDelegatedVotes(

        address from,

        address to,

        uint256 votes

    ) external {

        mapping(address => uint256)
            storage voteMap =
                delegatedVotes[msg.sender];

        uint256 senderVotes =
            voteMap[from];

        require(
            senderVotes >= votes,
            "Not enough votes"
        );

        voteMap[from] =
            senderVotes - votes;

        voteMap[to] += votes;

        emit DelegatedVoteUpdated(
            msg.sender,
            from,
            voteMap[from]
        );

        emit DelegatedVoteUpdated(
            msg.sender,
            to,
            voteMap[to]
        );
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



    function getDailyLimit(

        address user,

        uint256 day

    )
        external
        view
        returns(uint256)
    {
        return dailyLimits[user][day];
    }
}
