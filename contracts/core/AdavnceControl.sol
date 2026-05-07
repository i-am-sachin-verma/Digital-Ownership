// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AdvancedIdentityRegistry is ERC721, AccessControl {

    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE =
        keccak256("ADMIN_ROLE");

    bytes32 public constant MODERATOR_ROLE =
        keccak256("MODERATOR_ROLE");



    uint256 private _tokenIds;



    struct Identity {

        uint256 tokenId;

        address owner;

        uint256 createdAt;

        uint256 reputation;

        bool compromised;

        bool frozen;

        string metadataURI;
    }



    struct VerificationRequest {

        uint256 tokenId;

        address requester;

        string proofURI;

        bool approved;

        bool rejected;

        uint256 submittedAt;
    };



    struct ActivityRecord {

        uint256 timestamp;

        string actionType;

        address actor;
    };



    mapping(address => uint256)
        public walletToToken;



    mapping(uint256 => Identity)
        public identities;



    mapping(uint256 => VerificationRequest[])
        internal verificationRequests;



    mapping(uint256 => ActivityRecord[])
        internal activityLogs;



    mapping(uint256 => mapping(string => string))
        internal metadata;



    mapping(uint256 => address)
        public recoveryWallet;



    mapping(address => bool)
        public bannedWallets;



    mapping(uint256 => bool)
        public sybilSuspected;



    mapping(uint256 => uint256[])
        internal linkedIdentities;



    event IdentityCreated(
        uint256 indexed tokenId,
        address indexed owner
    );



    event MetadataUpdated(
        uint256 indexed tokenId,
        string key,
        string value
    );



    event IdentityFrozen(
        uint256 indexed tokenId
    );



    event IdentityRecovered(
        uint256 indexed tokenId,
        address indexed newWallet
    );



    event SybilFlagged(
        uint256 indexed tokenId
    );



    constructor()
        ERC721(
            "AdvancedDecentralizedIdentity",
            "ADID"
        )
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _grantRole(ADMIN_ROLE, msg.sender);

        _grantRole(MODERATOR_ROLE, msg.sender);
    }



    function mintIdentity(
        string memory metadataURI_
    )
        external
    {
        require(
            walletToToken[msg.sender] == 0,
            "Already owns identity"
        );

        require(
            !bannedWallets[msg.sender],
            "Wallet banned"
        );



        _tokenIds++;

        uint256 tokenId = _tokenIds;



        _safeMint(msg.sender, tokenId);



        walletToToken[msg.sender] = tokenId;



        identities[tokenId] = Identity({
            tokenId: tokenId,
            owner: msg.sender,
            createdAt: block.timestamp,
            reputation: 1,
            compromised: false,
            frozen: false,
            metadataURI: metadataURI_
        });



        activityLogs[tokenId].push(
            ActivityRecord({
                timestamp: block.timestamp,
                actionType: "IDENTITY_CREATED",
                actor: msg.sender
            })
        );



        emit IdentityCreated(
            tokenId,
            msg.sender
        );
    }



    function updateMetadata(
        uint256 tokenId,
        string memory key,
        string memory value
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Not owner"
        );

        require(
            !identities[tokenId].frozen,
            "Identity frozen"
        );



        metadata[tokenId][key] = value;



        activityLogs[tokenId].push(
            ActivityRecord({
                timestamp: block.timestamp,
                actionType: "METADATA_UPDATED",
                actor: msg.sender
            })
        );



        emit MetadataUpdated(
            tokenId,
            key,
            value
        );
    }



    function getMetadata(
        uint256 tokenId,
        string memory key
    )
        external
        view
        returns(string memory)
    {
        return metadata[tokenId][key];
    }



    function submitVerificationRequest(
        uint256 tokenId,
        string memory proofURI
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Unauthorized"
        );



        verificationRequests[tokenId].push(
            VerificationRequest({
                tokenId: tokenId,
                requester: msg.sender,
                proofURI: proofURI,
                approved: false,
                rejected: false,
                submittedAt: block.timestamp
            })
        );



        activityLogs[tokenId].push(
            ActivityRecord({
                timestamp: block.timestamp,
                actionType: "VERIFICATION_REQUESTED",
                actor: msg.sender
            })
        );
    }



    function approveVerification(
        uint256 tokenId,
        uint256 requestIndex
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        VerificationRequest storage request =
            verificationRequests[tokenId][requestIndex];



        require(
            !request.approved,
            "Already approved"
        );



        request.approved = true;



        identities[tokenId].reputation += 10;



        activityLogs[tokenId].push(
            ActivityRecord({
                timestamp: block.timestamp,
                actionType: "VERIFICATION_APPROVED",
                actor: msg.sender
            })
        );
    }



    function freezeIdentity(
        uint256 tokenId
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        identities[tokenId].frozen = true;

        emit IdentityFrozen(tokenId);
    }



    function markCompromised(
        uint256 tokenId
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Unauthorized"
        );



        identities[tokenId].compromised = true;



        activityLogs[tokenId].push(
            ActivityRecord({
                timestamp: block.timestamp,
                actionType: "COMPROMISED",
                actor: msg.sender
            })
        );
    }



    function registerRecoveryWallet(
        uint256 tokenId,
        address backup
    )
        external
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Unauthorized"
        );



        recoveryWallet[tokenId] = backup;
    }



    function recoverIdentity(
        uint256 tokenId
    )
        external
    {
        require(
            msg.sender ==
            recoveryWallet[tokenId],
            "Not recovery wallet"
        );



        address oldOwner =
            ownerOf(tokenId);



        walletToToken[oldOwner] = 0;

        walletToToken[msg.sender] = tokenId;



        _transfer(
            oldOwner,
            msg.sender,
            tokenId
        );



        identities[tokenId].owner =
            msg.sender;

        identities[tokenId].compromised =
            false;



        emit IdentityRecovered(
            tokenId,
            msg.sender
        );
    }



    function increaseReputation(
        uint256 tokenId,
        uint256 points
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        identities[tokenId].reputation += points;
    }



    function decreaseReputation(
        uint256 tokenId,
        uint256 points
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        if (
            identities[tokenId].reputation
            > points
        ) {
            identities[tokenId].reputation
                -= points;
        }
    }



    function flagSybil(
        uint256 tokenId
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        sybilSuspected[tokenId] = true;

        emit SybilFlagged(tokenId);
    }



    function linkIdentity(
        uint256 tokenA,
        uint256 tokenB
    )
        external
        onlyRole(MODERATOR_ROLE)
    {
        linkedIdentities[tokenA]
            .push(tokenB);

        linkedIdentities[tokenB]
            .push(tokenA);
    }



    function getLinkedIdentities(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return linkedIdentities[tokenId];
    }



    function getActivityCount(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return activityLogs[tokenId].length;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721,
            AccessControl
        )
        returns(bool)
    {
        return super.supportsInterface(
            interfaceId
        );
    }



    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    )
        internal
        override
    {
        super._beforeTokenTransfer(
            from,
            to,
            tokenId,
            batchSize
        );



        if (from != address(0)) {

            require(
                !identities[tokenId].frozen,
                "Frozen identity"
            );
        }
    }
}