// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract InstitutionalAttestationFramework is AccessControl {



    bytes32 public constant
        ROOT_TRUST_ROLE =
        keccak256("ROOT_TRUST_ROLE");

    bytes32 public constant
        INSTITUTION_ROLE =
        keccak256("INSTITUTION_ROLE");

    bytes32 public constant
        ISSUER_ROLE =
        keccak256("ISSUER_ROLE");



    enum CredentialType {
        UNIVERSITY,
        COMPANY,
        DAO,
        GOVERNMENT,
        CERTIFICATION,
        CONTRIBUTOR
    }



    enum CredentialStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }



    struct TrustAnchor {

        uint256 anchorId;

        address institution;

        string institutionName;

        string metadataURI;

        uint256 createdAt;

        bool active;

        uint256 reputation;
    };



    struct Credential {

        uint256 credentialId;

        uint256 anchorId;

        uint256 tokenId;

        address issuer;

        CredentialType credentialType;

        string title;

        string metadataURI;

        uint256 issuedAt;

        uint256 expiry;

        CredentialStatus status;
    };



    struct InstitutionProfile {

        string name;

        string website;

        string jurisdiction;

        bool verified;

        uint256 issuedCredentials;
    };



    uint256 public anchorCounter;

    uint256 public credentialCounter;



    mapping(uint256 => TrustAnchor)
        public trustAnchors;

    mapping(uint256 => Credential)
        public credentials;



    mapping(address => uint256)
        public institutionToAnchor;



    mapping(uint256 => uint256[])
        public tokenCredentials;



    mapping(uint256 => uint256[])
        public anchorCredentials;



    mapping(address => InstitutionProfile)
        public institutionProfiles;



    mapping(uint256 => bool)
        public suspendedAnchors;



    event TrustAnchorCreated(
        uint256 indexed anchorId,
        address indexed institution,
        string institutionName
    );



    event CredentialIssued(
        uint256 indexed credentialId,
        uint256 indexed tokenId,
        uint256 indexed anchorId
    );



    event CredentialRevoked(
        uint256 indexed credentialId
    );



    event AnchorSuspended(
        uint256 indexed anchorId
    );



    event ReputationUpdated(
        uint256 indexed anchorId,
        uint256 reputation
    );



    constructor() {

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ROOT_TRUST_ROLE,
            msg.sender
        );
    }



    function registerInstitution(

        address institution,

        string calldata name,

        string calldata website,

        string calldata jurisdiction,

        string calldata metadataURI

    )
        external
        onlyRole(ROOT_TRUST_ROLE)
    {

        require(
            institutionToAnchor[institution]
                == 0,
            "Already registered"
        );



        anchorCounter++;

        uint256 anchorId =
            anchorCounter;



        trustAnchors[anchorId]
            = TrustAnchor({

                anchorId: anchorId,

                institution: institution,

                institutionName: name,

                metadataURI: metadataURI,

                createdAt: block.timestamp,

                active: true,

                reputation: 100
            });



        institutionProfiles[institution]
            = InstitutionProfile({

                name: name,

                website: website,

                jurisdiction: jurisdiction,

                verified: true,

                issuedCredentials: 0
            });



        institutionToAnchor[institution]
            = anchorId;



        _grantRole(
            INSTITUTION_ROLE,
            institution
        );



        emit TrustAnchorCreated(
            anchorId,
            institution,
            name
        );
    }



    function authorizeIssuer(

        address issuer

    ) external {

        require(
            hasRole(
                INSTITUTION_ROLE,
                msg.sender
            ),
            "Not institution"
        );



        _grantRole(
            ISSUER_ROLE,
            issuer
        );
    }



    function issueCredential(

        uint256 tokenId,

        CredentialType credentialType,

        string calldata title,

        string calldata metadataURI,

        uint256 validityPeriod

    ) external {

        require(
            hasRole(
                ISSUER_ROLE,
                msg.sender
            ) ||
            hasRole(
                INSTITUTION_ROLE,
                msg.sender
            ),
            "Unauthorized issuer"
        );



        uint256 anchorId =
            institutionToAnchor[msg.sender];



        require(
            anchorId != 0,
            "No trust anchor"
        );



        require(
            !suspendedAnchors[anchorId],
            "Anchor suspended"
        );



        credentialCounter++;

        uint256 credentialId =
            credentialCounter;



        credentials[credentialId]
            = Credential({

                credentialId: credentialId,

                anchorId: anchorId,

                tokenId: tokenId,

                issuer: msg.sender,

                credentialType: credentialType,

                title: title,

                metadataURI: metadataURI,

                issuedAt: block.timestamp,

                expiry:
                    block.timestamp
                    + validityPeriod,

                status:
                    CredentialStatus.ACTIVE
            });



        tokenCredentials[tokenId]
            .push(credentialId);



        anchorCredentials[anchorId]
            .push(credentialId);



        institutionProfiles[msg.sender]
            .issuedCredentials++;



        emit CredentialIssued(
            credentialId,
            tokenId,
            anchorId
        );
    }



    function revokeCredential(
        uint256 credentialId
    ) external {

        Credential storage credential =
            credentials[credentialId];



        require(
            credential.issuer
                == msg.sender,
            "Unauthorized"
        );



        credential.status =
            CredentialStatus.REVOKED;



        emit CredentialRevoked(
            credentialId
        );
    }



    function suspendTrustAnchor(
        uint256 anchorId
    )
        external
        onlyRole(ROOT_TRUST_ROLE)
    {

        suspendedAnchors[anchorId]
            = true;

        trustAnchors[anchorId]
            .active = false;



        emit AnchorSuspended(
            anchorId
        );
    }



    function updateAnchorReputation(

        uint256 anchorId,

        uint256 reputation

    )
        external
        onlyRole(ROOT_TRUST_ROLE)
    {

        trustAnchors[anchorId]
            .reputation = reputation;



        emit ReputationUpdated(
            anchorId,
            reputation
        );
    }



    function validateCredential(
        uint256 credentialId
    )
        external
        view
        returns(bool)
    {

        Credential storage credential =
            credentials[credentialId];



        if (
            credential.status
                != CredentialStatus.ACTIVE
        ) {
            return false;
        }



        if (
            block.timestamp
                > credential.expiry
        ) {
            return false;
        }



        if (
            suspendedAnchors[
                credential.anchorId
            ]
        ) {
            return false;
        }



        return true;
    }



    function getTokenCredentials(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return tokenCredentials[tokenId];
    }



    function getAnchorCredentials(
        uint256 anchorId
    )
        external
        view
        returns(uint256[] memory)
    {
        return anchorCredentials[anchorId];
    }



    function getInstitutionProfile(
        address institution
    )
        external
        view
        returns(
            InstitutionProfile memory
        )
    {
        return institutionProfiles[institution];
    }



    function getTrustAnchor(
        uint256 anchorId
    )
        external
        view
        returns(TrustAnchor memory)
    {
        return trustAnchors[anchorId];
    }



    function getCredential(
        uint256 credentialId
    )
        external
        view
        returns(Credential memory)
    {
        return credentials[credentialId];
    }



    function getCredentialCount(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            tokenCredentials[tokenId]
                .length;
    }



    function isInstitutionVerified(
        address institution
    )
        external
        view
        returns(bool)
    {
        return
            institutionProfiles[
                institution
            ].verified;
    }
}