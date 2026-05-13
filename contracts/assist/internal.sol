// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HierarchicalInstitutionRoles is AccessControl {



    bytes32 public constant
        ROOT_AUTHORITY_ROLE =
        keccak256(
            "ROOT_AUTHORITY_ROLE"
        );

    bytes32 public constant
        GOVERNANCE_ROLE =
        keccak256(
            "GOVERNANCE_ROLE"
        );

    bytes32 public constant
        INSTITUTION_ROLE =
        keccak256(
            "INSTITUTION_ROLE"
        );

    bytes32 public constant
        VERIFIER_ROLE =
        keccak256(
            "VERIFIER_ROLE"
        );

    bytes32 public constant
        ISSUER_ROLE =
        keccak256(
            "ISSUER_ROLE"
        );



    enum InstitutionTier {
        ROOT,
        GOVERNANCE,
        INSTITUTION,
        VERIFIER
    }



    struct InstitutionProfile {

        uint256 institutionId;

        string name;

        string metadataURI;

        InstitutionTier tier;

        uint256 reputation;

        uint64 createdAt;

        bool active;
    };



    struct Credential {

        uint256 credentialId;

        uint256 tokenId;

        address issuer;

        string credentialType;

        string credentialURI;

        uint64 issuedAt;

        uint64 expiry;

        bool revoked;
    };



    uint256 public institutionCounter;

    uint256 public credentialCounter;



    mapping(address => InstitutionProfile)
        public institutions;



    mapping(uint256 => Credential)
        public credentials;



    mapping(address => address)
        public parentAuthority;



    mapping(address => address[])
        public childAuthorities;



    mapping(address => bool)
        public suspendedAuthority;



    mapping(uint256 => uint256[])
        public tokenCredentials;



    event InstitutionRegistered(
        address indexed institution,
        InstitutionTier tier
    );



    event AuthorityLinked(
        address indexed parent,
        address indexed child
    );



    event CredentialIssued(
        uint256 indexed credentialId,
        uint256 indexed tokenId
    );



    event AuthoritySuspended(
        address indexed authority
    );



    event CredentialRevoked(
        uint256 indexed credentialId
    );



    constructor() {

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            ROOT_AUTHORITY_ROLE,
            msg.sender
        );



        _setRoleAdmin(
            GOVERNANCE_ROLE,
            ROOT_AUTHORITY_ROLE
        );

        _setRoleAdmin(
            INSTITUTION_ROLE,
            GOVERNANCE_ROLE
        );

        _setRoleAdmin(
            VERIFIER_ROLE,
            INSTITUTION_ROLE
        );

        _setRoleAdmin(
            ISSUER_ROLE,
            VERIFIER_ROLE
        );
    }



    function registerInstitution(

        address institution,

        string calldata name,

        string calldata metadataURI,

        InstitutionTier tier

    ) external {

        if (
            tier
                == InstitutionTier.GOVERNANCE
        ) {

            require(
                hasRole(
                    ROOT_AUTHORITY_ROLE,
                    msg.sender
                ),
                "Requires root role"
            );



            _grantRole(
                GOVERNANCE_ROLE,
                institution
            );
        }



        if (
            tier
                == InstitutionTier.INSTITUTION
        ) {

            require(
                hasRole(
                    GOVERNANCE_ROLE,
                    msg.sender
                ),
                "Requires governance role"
            );



            _grantRole(
                INSTITUTION_ROLE,
                institution
            );
        }



        if (
            tier
                == InstitutionTier.VERIFIER
        ) {

            require(
                hasRole(
                    INSTITUTION_ROLE,
                    msg.sender
                ),
                "Requires institution role"
            );



            _grantRole(
                VERIFIER_ROLE,
                institution
            );
        }



        institutionCounter++;

        uint256 institutionId =
            institutionCounter;



        institutions[institution]
            = InstitutionProfile({

                institutionId:
                    institutionId,

                name: name,

                metadataURI:
                    metadataURI,

                tier: tier,

                reputation: 100,

                createdAt:
                    uint64(block.timestamp),

                active: true
            });



        parentAuthority[institution]
            = msg.sender;



        childAuthorities[msg.sender]
            .push(institution);



        emit InstitutionRegistered(
            institution,
            tier
        );



        emit AuthorityLinked(
            msg.sender,
            institution
        );
    }



    function authorizeIssuer(
        address issuer
    ) external {

        require(
            hasRole(
                VERIFIER_ROLE,
                msg.sender
            ),
            "Verifier required"
        );



        _grantRole(
            ISSUER_ROLE,
            issuer
        );



        parentAuthority[issuer]
            = msg.sender;



        childAuthorities[msg.sender]
            .push(issuer);
    }



    function issueCredential(

        uint256 tokenId,

        string calldata credentialType,

        string calldata credentialURI,

        uint64 validity

    ) external {

        require(
            hasRole(
                ISSUER_ROLE,
                msg.sender
            ) ||
            hasRole(
                VERIFIER_ROLE,
                msg.sender
            ),
            "Unauthorized issuer"
        );



        require(
            !suspendedAuthority[msg.sender],
            "Authority suspended"
        );



        credentialCounter++;

        uint256 credentialId =
            credentialCounter;



        credentials[credentialId]
            = Credential({

                credentialId:
                    credentialId,

                tokenId: tokenId,

                issuer: msg.sender,

                credentialType:
                    credentialType,

                credentialURI:
                    credentialURI,

                issuedAt:
                    uint64(block.timestamp),

                expiry:
                    uint64(
                        block.timestamp
                        + validity
                    ),

                revoked: false
            });



        tokenCredentials[tokenId]
            .push(credentialId);



        emit CredentialIssued(
            credentialId,
            tokenId
        );
    }



    function suspendAuthority(
        address authority
    ) external {

        require(
            hasRole(
                GOVERNANCE_ROLE,
                msg.sender
            ) ||
            hasRole(
                ROOT_AUTHORITY_ROLE,
                msg.sender
            ),
            "No suspension rights"
        );



        suspendedAuthority[authority]
            = true;



        institutions[authority]
            .active = false;



        emit AuthoritySuspended(
            authority
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



        credential.revoked = true;



        emit CredentialRevoked(
            credentialId
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



        if (credential.revoked) {
            return false;
        }



        if (
            block.timestamp
                > credential.expiry
        ) {
            return false;
        }



        if (
            suspendedAuthority[
                credential.issuer
            ]
        ) {
            return false;
        }



        return true;
    }



    function getInstitution(
        address institution
    )
        external
        view
        returns(
            InstitutionProfile memory
        )
    {
        return institutions[institution];
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



    function getChildAuthorities(
        address authority
    )
        external
        view
        returns(address[] memory)
    {
        return childAuthorities[authority];
    }



    function getParentAuthority(
        address authority
    )
        external
        view
        returns(address)
    {
        return parentAuthority[authority];
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



    function isAuthorizedIssuer(
        address issuer
    )
        external
        view
        returns(bool)
    {
        return
            hasRole(
                ISSUER_ROLE,
                issuer
            );
    }
}