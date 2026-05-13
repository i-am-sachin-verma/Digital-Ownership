// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract InstitutionalCredentialRevocation is AccessControl {



    bytes32 public constant
        INSTITUTION_ROLE =
        keccak256(
            "INSTITUTION_ROLE"
        );

    bytes32 public constant
        ADMIN_ROLE =
        keccak256(
            "ADMIN_ROLE"
        );

    bytes32 public constant
        ISSUER_ROLE =
        keccak256(
            "ISSUER_ROLE"
        );



    enum CredentialStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }



    struct Credential {

        uint256 credentialId;

        uint256 tokenId;

        address issuer;

        address institution;

        string credentialType;

        string metadataURI;

        uint64 issuedAt;

        uint64 expiry;

        CredentialStatus status;
    };



    struct InstitutionProfile {

        string name;

        bool active;

        uint256 issuedCredentials;

        uint256 revokedCredentials;
    };



    uint256 public credentialCounter;



    mapping(uint256 => Credential)
        public credentials;



    mapping(address => InstitutionProfile)
        public institutions;



    mapping(address => address)
        public issuerInstitution;



    mapping(address => bool)
        public formerAdministrators;



    mapping(uint256 => string)
        public revocationReasons;



    event CredentialIssued(
        uint256 indexed credentialId,
        uint256 indexed tokenId,
        address indexed issuer
    );



    event CredentialRevoked(
        uint256 indexed credentialId,
        address indexed revokedBy,
        string reason
    );



    event IssuerRemoved(
        address indexed issuer,
        address indexed institution
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
    }



    function registerInstitution(

        address institution,

        string calldata name

    ) external
        onlyRole(ADMIN_ROLE)
    {

        _grantRole(
            INSTITUTION_ROLE,
            institution
        );



        institutions[institution]
            = InstitutionProfile({

                name: name,

                active: true,

                issuedCredentials: 0,

                revokedCredentials: 0
            });
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



        issuerInstitution[issuer]
            = msg.sender;
    }



    function removeIssuer(
        address issuer
    ) external {

        require(
            hasRole(
                INSTITUTION_ROLE,
                msg.sender
            ),
            "Not institution"
        );



        require(
            issuerInstitution[issuer]
                == msg.sender,
            "Invalid institution"
        );



        formerAdministrators[issuer]
            = true;



        revokeRole(
            ISSUER_ROLE,
            issuer
        );



        emit IssuerRemoved(
            issuer,
            msg.sender
        );
    }



    function issueCredential(

        uint256 tokenId,

        string calldata credentialType,

        string calldata metadataURI,

        uint64 validity

    ) external {

        require(
            hasRole(
                ISSUER_ROLE,
                msg.sender
            ),
            "Unauthorized issuer"
        );



        credentialCounter++;

        uint256 credentialId =
            credentialCounter;



        address institution =
            issuerInstitution[msg.sender];



        credentials[credentialId]
            = Credential({

                credentialId:
                    credentialId,

                tokenId: tokenId,

                issuer: msg.sender,

                institution:
                    institution,

                credentialType:
                    credentialType,

                metadataURI:
                    metadataURI,

                issuedAt:
                    uint64(block.timestamp),

                expiry:
                    uint64(
                        block.timestamp
                        + validity
                    ),

                status:
                    CredentialStatus.ACTIVE
            });



        institutions[institution]
            .issuedCredentials++;



        emit CredentialIssued(
            credentialId,
            tokenId,
            msg.sender
        );
    }



    /*
    |--------------------------------------------------------------------------
    | FIX:
    | Institution-level revocation authority
    |--------------------------------------------------------------------------
    |
    | Even if issuer/admin leaves,
    | institution can still revoke
    | previously issued credentials.
    |
    */

    function revokeCredential(

        uint256 credentialId,

        string calldata reason

    ) external {

        Credential storage credential =
            credentials[credentialId];



        require(
            credential.status
                == CredentialStatus.ACTIVE,
            "Already revoked"
        );



        bool issuerRevoking =
            credential.issuer
                == msg.sender;



        bool institutionRevoking =

            credential.institution
                == msg.sender

            &&

            hasRole(
                INSTITUTION_ROLE,
                msg.sender
            );



        require(
            issuerRevoking
            || institutionRevoking,
            "Unauthorized revocation"
        );



        credential.status =
            CredentialStatus.REVOKED;



        revocationReasons[
            credentialId
        ] = reason;



        institutions[
            credential.institution
        ].revokedCredentials++;



        emit CredentialRevoked(
            credentialId,
            msg.sender,
            reason
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



        return true;
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



    function getRevocationReason(
        uint256 credentialId
    )
        external
        view
        returns(string memory)
    {
        return revocationReasons[
            credentialId
        ];
    }



    function isFormerAdministrator(
        address user
    )
        external
        view
        returns(bool)
    {
        return formerAdministrators[user];
    }



    function getIssuerInstitution(
        address issuer
    )
        external
        view
        returns(address)
    {
        return issuerInstitution[
            issuer
        ];
    }
}