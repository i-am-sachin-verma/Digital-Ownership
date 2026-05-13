// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyPausableIdentitySystem is
    AccessControl,
    Pausable
{



    bytes32 public constant
        SECURITY_ROLE =
        keccak256(
            "SECURITY_ROLE"
        );

    bytes32 public constant
        ADMIN_ROLE =
        keccak256(
            "ADMIN_ROLE"
        );



    struct Identity {

        uint256 tokenId;

        address owner;

        uint64 createdAt;

        bool active;
    };



    struct Endorsement {

        uint256 fromToken;

        uint256 toToken;

        uint64 timestamp;

        bool active;
    };



    uint256 public tokenCounter;

    uint256 public endorsementCounter;



    mapping(uint256 => Identity)
        public identities;

    mapping(uint256 => Endorsement)
        public endorsements;



    mapping(address => uint256)
        public walletToIdentity;



    mapping(uint256 => bool)
        public frozenIdentity;



    event IdentityCreated(
        uint256 indexed tokenId,
        address indexed owner
    );



    event EndorsementCreated(
        uint256 indexed endorsementId,
        uint256 indexed fromToken,
        uint256 indexed toToken
    );



    event EmergencyPause(
        address indexed triggeredBy
    );



    event EmergencyUnpause(
        address indexed triggeredBy
    );



    event IdentityFrozen(
        uint256 indexed tokenId
    );



    constructor() {

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            SECURITY_ROLE,
            msg.sender
        );
    }



    modifier onlyActiveIdentity(
        uint256 tokenId
    ) {

        require(
            !frozenIdentity[tokenId],
            "Identity frozen"
        );

        require(
            identities[tokenId].active,
            "Inactive identity"
        );

        _;
    }



    /*
    |--------------------------------------------------------------------------
    | EMERGENCY PAUSE
    |--------------------------------------------------------------------------
    |
    | Stops all sensitive operations
    | during exploit conditions.
    |
    */

    function pauseSystem()
        external
        onlyRole(SECURITY_ROLE)
    {

        _pause();



        emit EmergencyPause(
            msg.sender
        );
    }



    function unpauseSystem()
        external
        onlyRole(ADMIN_ROLE)
    {

        _unpause();



        emit EmergencyUnpause(
            msg.sender
        );
    }



    function createIdentity()
        external
        whenNotPaused
    {

        require(
            walletToIdentity[msg.sender]
                == 0,
            "Identity exists"
        );



        tokenCounter++;

        uint256 tokenId =
            tokenCounter;



        identities[tokenId]
            = Identity({

                tokenId: tokenId,

                owner: msg.sender,

                createdAt:
                    uint64(block.timestamp),

                active: true
            });



        walletToIdentity[msg.sender]
            = tokenId;



        emit IdentityCreated(
            tokenId,
            msg.sender
        );
    }



    function createEndorsement(

        uint256 fromToken,

        uint256 toToken

    )
        external
        whenNotPaused
        onlyActiveIdentity(fromToken)
        onlyActiveIdentity(toToken)
    {

        endorsementCounter++;

        uint256 endorsementId =
            endorsementCounter;



        endorsements[endorsementId]
            = Endorsement({

                fromToken: fromToken,

                toToken: toToken,

                timestamp:
                    uint64(block.timestamp),

                active: true
            });



        emit EndorsementCreated(
            endorsementId,
            fromToken,
            toToken
        );
    }



    function freezeIdentity(
        uint256 tokenId
    )
        external
        onlyRole(SECURITY_ROLE)
    {

        frozenIdentity[tokenId]
            = true;



        emit IdentityFrozen(
            tokenId
        );
    }



    function unfreezeIdentity(
        uint256 tokenId
    )
        external
        onlyRole(ADMIN_ROLE)
    {

        frozenIdentity[tokenId]
            = false;
    }



    function revokeIdentity(
        uint256 tokenId
    )
        external
        whenNotPaused
        onlyRole(ADMIN_ROLE)
    {

        identities[tokenId]
            .active = false;
    }



    function reactivateIdentity(
        uint256 tokenId
    )
        external
        whenNotPaused
        onlyRole(ADMIN_ROLE)
    {

        identities[tokenId]
            .active = true;
    }



    function emergencyDisableEndorsement(
        uint256 endorsementId
    )
        external
        onlyRole(SECURITY_ROLE)
    {

        endorsements[endorsementId]
            .active = false;
    }



    function isSystemPaused()
        external
        view
        returns(bool)
    {
        return paused();
    }



    function getIdentity(
        uint256 tokenId
    )
        external
        view
        returns(Identity memory)
    {
        return identities[tokenId];
    }



    function getEndorsement(
        uint256 endorsementId
    )
        external
        view
        returns(Endorsement memory)
    {
        return endorsements[endorsementId];
    }



    function isIdentityFrozen(
        uint256 tokenId
    )
        external
        view
        returns(bool)
    {
        return frozenIdentity[tokenId];
    }
}