// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecentralizedTrustScoring {



    enum CredentialType {
        DEVELOPER,
        STUDENT,
        DAO_MEMBER,
        VALIDATOR,
        CONTRIBUTOR
    }



    struct Endorsement {

        uint256 fromToken;

        uint256 toToken;

        CredentialType credentialType;

        uint256 weight;

        uint256 timestamp;

        bool active;
    }



    struct TrustScore {

        uint256 totalScore;

        uint256 endorsementScore;

        uint256 reputationScore;

        uint256 activityScore;

        uint256 updatedAt;
    };



    uint256 public endorsementCounter;



    mapping(uint256 => Endorsement)
        public endorsements;



    mapping(uint256 => uint256[])
        public receivedEndorsements;



    mapping(uint256 => uint256)
        public reputationPoints;



    mapping(uint256 => uint256)
        public activityPoints;



    mapping(uint256 => TrustScore)
        public trustScores;



    mapping(CredentialType => uint256)
        public credentialWeights;



    event EndorsementAdded(
        uint256 indexed endorsementId,
        uint256 indexed fromToken,
        uint256 indexed toToken
    );



    event TrustScoreUpdated(
        uint256 indexed tokenId,
        uint256 score
    );



    constructor() {

        credentialWeights[
            CredentialType.DEVELOPER
        ] = 10;

        credentialWeights[
            CredentialType.STUDENT
        ] = 5;

        credentialWeights[
            CredentialType.DAO_MEMBER
        ] = 15;

        credentialWeights[
            CredentialType.VALIDATOR
        ] = 20;

        credentialWeights[
            CredentialType.CONTRIBUTOR
        ] = 8;
    }



    function addEndorsement(

        uint256 fromToken,

        uint256 toToken,

        CredentialType credentialType

    ) external {

        require(
            fromToken != toToken,
            "Self endorsement"
        );



        endorsementCounter++;

        uint256 endorsementId =
            endorsementCounter;



        uint256 weight =
            credentialWeights[
                credentialType
            ];



        endorsements[endorsementId]
            = Endorsement({

                fromToken: fromToken,

                toToken: toToken,

                credentialType:
                    credentialType,

                weight: weight,

                timestamp:
                    block.timestamp,

                active: true
            });



        receivedEndorsements[toToken]
            .push(endorsementId);



        _recalculateTrustScore(
            toToken
        );



        emit EndorsementAdded(
            endorsementId,
            fromToken,
            toToken
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



        endorsement.active = false;



        _recalculateTrustScore(
            endorsement.toToken
        );
    }



    function addReputationPoints(

        uint256 tokenId,

        uint256 points

    ) external {

        reputationPoints[tokenId]
            += points;



        _recalculateTrustScore(
            tokenId
        );
    }



    function addActivityPoints(

        uint256 tokenId,

        uint256 points

    ) external {

        activityPoints[tokenId]
            += points;



        _recalculateTrustScore(
            tokenId
        );
    }



    function _recalculateTrustScore(
        uint256 tokenId
    ) internal {

        uint256[] memory endorsementsList =
            receivedEndorsements[tokenId];



        uint256 endorsementScore;



        uint256 length =
            endorsementsList.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            Endorsement storage endorsement =
                endorsements[
                    endorsementsList[i]
                ];



            if (endorsement.active) {

                endorsementScore +=
                    endorsement.weight;
            }
        }



        uint256 reputationScore =
            reputationPoints[tokenId];



        uint256 activityScore =
            activityPoints[tokenId];



        uint256 totalScore =
            endorsementScore
            + reputationScore
            + activityScore;



        trustScores[tokenId]
            = TrustScore({

                totalScore: totalScore,

                endorsementScore:
                    endorsementScore,

                reputationScore:
                    reputationScore,

                activityScore:
                    activityScore,

                updatedAt:
                    block.timestamp
            });



        emit TrustScoreUpdated(
            tokenId,
            totalScore
        );
    }



    function getTrustScore(
        uint256 tokenId
    )
        external
        view
        returns(TrustScore memory)
    {
        return trustScores[tokenId];
    }



    function getEndorsementScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            trustScores[tokenId]
                .endorsementScore;
    }



    function getReputationScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            trustScores[tokenId]
                .reputationScore;
    }



    function getActivityScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            trustScores[tokenId]
                .activityScore;
    }



    function getTotalTrustScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            trustScores[tokenId]
                .totalScore;
    }



    function getReceivedEndorsements(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return
            receivedEndorsements[tokenId];
    }



    function updateCredentialWeight(

        CredentialType credentialType,

        uint256 newWeight

    ) external {

        credentialWeights[
            credentialType
        ] = newWeight;
    }



    function calculateLiveScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {

        uint256[] memory endorsementsList =
            receivedEndorsements[tokenId];



        uint256 score;



        uint256 length =
            endorsementsList.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            Endorsement storage endorsement =
                endorsements[
                    endorsementsList[i]
                ];



            if (endorsement.active) {

                score +=
                    endorsement.weight;
            }
        }



        score +=
            reputationPoints[tokenId];

        score +=
            activityPoints[tokenId];



        return score;
    }
}