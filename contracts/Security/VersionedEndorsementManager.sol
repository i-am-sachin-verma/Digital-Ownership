// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VersionedEndorsementManager {



    enum CredentialType {
        DEVELOPER,
        STUDENT,
        DAO_MEMBER,
        RESEARCHER,
        CONTRIBUTOR,
        VALIDATOR
    }



    enum EndorsementStatus {
        ACTIVE,
        REVOKED,
        EXPIRED
    }



    struct EndorsementVersion {

        uint256 versionId;

        uint256 fromToken;

        uint256 toToken;

        CredentialType credentialType;

        string message;

        uint256 issuedAt;

        uint256 expiry;

        bool revoked;

        uint256 revokedAt;

        address issuer;

        EndorsementStatus status;
    }



    struct CredentialStats {

        uint256 activeCount;

        uint256 revokedCount;

        uint256 expiredCount;
    };



    uint256 public versionCounter;



    mapping(uint256 => EndorsementVersion)
        public endorsementVersions;



    mapping(uint256 => uint256[])
        public tokenReceivedEndorsements;

    mapping(uint256 => uint256[])
        public tokenGivenEndorsements;



    mapping(uint256 => mapping(CredentialType => uint256))
        public activeCredentialCount;



    mapping(uint256 => CredentialStats)
        public tokenStats;



    event EndorsementCreated(
        uint256 indexed versionId,
        uint256 indexed fromToken,
        uint256 indexed toToken,
        CredentialType credentialType
    );



    event EndorsementRevoked(
        uint256 indexed versionId,
        uint256 indexed tokenId
    );



    event EndorsementExpired(
        uint256 indexed versionId
    );



    function createEndorsement(

        uint256 fromToken,

        uint256 toToken,

        CredentialType credentialType,

        string calldata message,

        uint256 duration

    ) external {

        require(
            fromToken != toToken,
            "Self endorsement"
        );



        versionCounter++;

        uint256 versionId =
            versionCounter;



        EndorsementVersion
            storage endorsement =
                endorsementVersions[
                    versionId
                ];



        endorsement.versionId =
            versionId;

        endorsement.fromToken =
            fromToken;

        endorsement.toToken =
            toToken;

        endorsement.credentialType =
            credentialType;

        endorsement.message =
            message;

        endorsement.issuedAt =
            block.timestamp;

        endorsement.expiry =
            block.timestamp + duration;

        endorsement.issuer =
            msg.sender;

        endorsement.status =
            EndorsementStatus.ACTIVE;



        tokenReceivedEndorsements[
            toToken
        ].push(versionId);



        tokenGivenEndorsements[
            fromToken
        ].push(versionId);



        activeCredentialCount[
            toToken
        ][credentialType]++;



        tokenStats[toToken]
            .activeCount++;



        emit EndorsementCreated(
            versionId,
            fromToken,
            toToken,
            credentialType
        );
    }



    function revokeEndorsement(
        uint256 versionId
    ) external {

        EndorsementVersion
            storage endorsement =
                endorsementVersions[
                    versionId
                ];



        require(
            endorsement.issuer
                == msg.sender,
            "Unauthorized"
        );

        require(
            !endorsement.revoked,
            "Already revoked"
        );



        endorsement.revoked = true;

        endorsement.revokedAt =
            block.timestamp;

        endorsement.status =
            EndorsementStatus.REVOKED;



        uint256 target =
            endorsement.toToken;



        CredentialType credential =
            endorsement.credentialType;



        activeCredentialCount[
            target
        ][credential]--;



        tokenStats[target]
            .activeCount--;

        tokenStats[target]
            .revokedCount++;



        emit EndorsementRevoked(
            versionId,
            target
        );
    }



    function markExpired(
        uint256 versionId
    ) public {

        EndorsementVersion
            storage endorsement =
                endorsementVersions[
                    versionId
                ];



        require(
            endorsement.status
                == EndorsementStatus.ACTIVE,
            "Invalid status"
        );

        require(
            block.timestamp
                > endorsement.expiry,
            "Not expired"
        );



        endorsement.status =
            EndorsementStatus.EXPIRED;



        uint256 target =
            endorsement.toToken;



        CredentialType credential =
            endorsement.credentialType;



        activeCredentialCount[
            target
        ][credential]--;



        tokenStats[target]
            .activeCount--;

        tokenStats[target]
            .expiredCount++;



        emit EndorsementExpired(
            versionId
        );
    }



    function getActiveEndorsements(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {

        uint256[] memory all =
            tokenReceivedEndorsements[
                tokenId
            ];



        uint256 count;



        uint256 length = all.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            EndorsementVersion
                storage endorsement =
                    endorsementVersions[
                        all[i]
                    ];



            bool valid =
                endorsement.status
                    == EndorsementStatus.ACTIVE
                &&
                block.timestamp
                    <= endorsement.expiry;



            if (valid) {
                count++;
            }
        }



        uint256[] memory active =
            new uint256[](count);



        uint256 index;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            EndorsementVersion
                storage endorsement =
                    endorsementVersions[
                        all[i]
                    ];



            bool valid =
                endorsement.status
                    == EndorsementStatus.ACTIVE
                &&
                block.timestamp
                    <= endorsement.expiry;



            if (valid) {

                active[index] =
                    endorsement.versionId;

                index++;
            }
        }



        return active;
    }



    function getRevokedEndorsements(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {

        uint256[] memory all =
            tokenReceivedEndorsements[
                tokenId
            ];



        uint256 count;



        uint256 length = all.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            if (
                endorsementVersions[
                    all[i]
                ].status
                    ==
                EndorsementStatus.REVOKED
            ) {
                count++;
            }
        }



        uint256[] memory revoked =
            new uint256[](count);



        uint256 index;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            if (
                endorsementVersions[
                    all[i]
                ].status
                    ==
                EndorsementStatus.REVOKED
            ) {

                revoked[index] =
                    all[i];

                index++;
            }
        }



        return revoked;
    }



    function getCredentialCount(

        uint256 tokenId,

        CredentialType credentialType

    )
        external
        view
        returns(uint256)
    {
        return
            activeCredentialCount[
                tokenId
            ][credentialType];
    }



    function getEndorsementHistory(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return
            tokenReceivedEndorsements[
                tokenId
            ];
    }



    function getGivenEndorsements(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return
            tokenGivenEndorsements[
                tokenId
            ];
    }



    function isEndorsementValid(
        uint256 versionId
    )
        external
        view
        returns(bool)
    {

        EndorsementVersion
            storage endorsement =
                endorsementVersions[
                    versionId
                ];



        return (
            endorsement.status
                == EndorsementStatus.ACTIVE
            &&
            block.timestamp
                <= endorsement.expiry
        );
    }
}