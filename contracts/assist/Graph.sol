// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IndexedEventIdentitySystem {



    struct Identity {

        uint256 tokenId;

        address owner;

        uint256 reputation;

        bool active;
    };



    struct Endorsement {

        uint256 endorsementId;

        uint256 fromToken;

        uint256 toToken;

        uint256 createdAt;

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



    /*
    |--------------------------------------------------------------------------
    | GRAPH-OPTIMIZED EVENTS
    |--------------------------------------------------------------------------
    |
    | Multiple indexed parameters
    | improve subgraph filtering
    | and query efficiency.
    |
    */

    event IdentityCreated(

        uint256 indexed tokenId,

        address indexed owner,

        uint256 reputation
    );



    event IdentityTransferred(

        uint256 indexed tokenId,

        address indexed oldOwner,

        address indexed newOwner
    );



    event ReputationUpdated(

        uint256 indexed tokenId,

        uint256 oldScore,

        uint256 newScore
    );



    event EndorsementCreated(

        uint256 indexed endorsementId,

        uint256 indexed fromToken,

        uint256 indexed toToken,

        uint256 timestamp
    );



    event EndorsementRevoked(

        uint256 indexed endorsementId,

        uint256 indexed fromToken,

        uint256 indexed toToken
    );



    event IdentityDeactivated(

        uint256 indexed tokenId,

        address indexed owner
    );



    event MetadataUpdated(

        uint256 indexed tokenId,

        bytes32 indexed key,

        string value
    );



    event TrustConnectionCreated(

        uint256 indexed fromToken,

        uint256 indexed toToken,

        bytes32 indexed relationType
    );



    function createIdentity()
        external
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

                reputation: 0,

                active: true
            });



        walletToIdentity[msg.sender]
            = tokenId;



        emit IdentityCreated(

            tokenId,

            msg.sender,

            0
        );
    }



    function transferIdentity(

        uint256 tokenId,

        address newOwner

    ) external {

        Identity storage identity =
            identities[tokenId];



        require(
            identity.owner
                == msg.sender,
            "Not owner"
        );



        address oldOwner =
            identity.owner;



        delete walletToIdentity[
            oldOwner
        ];



        identity.owner =
            newOwner;



        walletToIdentity[newOwner]
            = tokenId;



        emit IdentityTransferred(

            tokenId,

            oldOwner,

            newOwner
        );
    }



    function updateReputation(

        uint256 tokenId,

        uint256 score

    ) external {

        Identity storage identity =
            identities[tokenId];



        uint256 oldScore =
            identity.reputation;



        identity.reputation =
            score;



        emit ReputationUpdated(

            tokenId,

            oldScore,

            score
        );
    }



    function createEndorsement(

        uint256 fromToken,

        uint256 toToken

    ) external {

        endorsementCounter++;

        uint256 endorsementId =
            endorsementCounter;



        endorsements[endorsementId]
            = Endorsement({

                endorsementId:
                    endorsementId,

                fromToken:
                    fromToken,

                toToken:
                    toToken,

                createdAt:
                    block.timestamp,

                active: true
            });



        emit EndorsementCreated(

            endorsementId,

            fromToken,

            toToken,

            block.timestamp
        );
    }



    function revokeEndorsement(
        uint256 endorsementId
    ) external {

        Endorsement storage endorsement =
            endorsements[endorsementId];



        require(
            endorsement.active,
            "Already revoked"
        );



        endorsement.active =
            false;



        emit EndorsementRevoked(

            endorsementId,

            endorsement.fromToken,

            endorsement.toToken
        );
    }



    function deactivateIdentity(
        uint256 tokenId
    ) external {

        Identity storage identity =
            identities[tokenId];



        require(
            identity.owner
                == msg.sender,
            "Unauthorized"
        );



        identity.active = false;



        emit IdentityDeactivated(

            tokenId,

            msg.sender
        );
    }



    function updateMetadata(

        uint256 tokenId,

        bytes32 key,

        string calldata value

    ) external {

        require(
            identities[tokenId].owner
                == msg.sender,
            "Not owner"
        );



        emit MetadataUpdated(

            tokenId,

            key,

            value
        );
    }



    function createTrustConnection(

        uint256 fromToken,

        uint256 toToken,

        bytes32 relationType

    ) external {

        emit TrustConnectionCreated(

            fromToken,

            toToken,

            relationType
        );
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



    function getWalletIdentity(
        address wallet
    )
        external
        view
        returns(uint256)
    {
        return walletToIdentity[wallet];
    }
}