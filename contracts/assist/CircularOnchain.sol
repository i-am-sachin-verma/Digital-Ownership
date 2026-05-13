// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CircularEndorsementDetector {



    struct Endorsement {

        uint256 fromToken;

        uint256 toToken;

        uint256 timestamp;

        bool active;
    };



    uint256 public endorsementCounter;

    uint256 public constant
        MAX_DEPTH = 5;



    mapping(uint256 => Endorsement)
        public endorsements;



    mapping(uint256 => uint256[])
        internal adjacencyList;



    mapping(uint256 => mapping(uint256 => bool))
        public directConnection;



    mapping(uint256 => bool)
        public suspiciousIdentity;



    mapping(bytes32 => bool)
        public detectedRings;



    event EndorsementCreated(
        uint256 indexed endorsementId,
        uint256 indexed fromToken,
        uint256 indexed toToken
    );



    event CircularRingDetected(
        uint256 indexed fromToken,
        uint256 indexed toToken,
        bytes32 ringHash
    );



    event IdentityFlagged(
        uint256 indexed tokenId
    );



    function createEndorsement(

        uint256 fromToken,

        uint256 toToken

    ) external {

        require(
            fromToken != toToken,
            "Self endorsement"
        );

        require(
            !directConnection[
                fromToken
            ][toToken],
            "Already connected"
        );



        bool circular =
            detectCircularPath(
                toToken,
                fromToken,
                MAX_DEPTH
            );



        if (circular) {

            bytes32 ringHash =
                keccak256(
                    abi.encodePacked(
                        fromToken,
                        toToken,
                        block.timestamp
                    )
                );



            detectedRings[ringHash]
                = true;



            suspiciousIdentity[fromToken]
                = true;

            suspiciousIdentity[toToken]
                = true;



            emit CircularRingDetected(
                fromToken,
                toToken,
                ringHash
            );



            emit IdentityFlagged(
                fromToken
            );

            emit IdentityFlagged(
                toToken
            );
        }



        endorsementCounter++;

        uint256 endorsementId =
            endorsementCounter;



        endorsements[endorsementId]
            = Endorsement({

                fromToken: fromToken,

                toToken: toToken,

                timestamp:
                    block.timestamp,

                active: true
            });



        adjacencyList[fromToken]
            .push(toToken);



        directConnection[fromToken][toToken]
            = true;



        emit EndorsementCreated(
            endorsementId,
            fromToken,
            toToken
        );
    }



    function detectCircularPath(

        uint256 current,

        uint256 target,

        uint256 depth

    )
        public
        view
        returns(bool)
    {

        if (current == target) {
            return true;
        }



        if (depth == 0) {
            return false;
        }



        uint256[] memory neighbors =
            adjacencyList[current];



        uint256 length =
            neighbors.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            bool found =
                detectCircularPath(

                    neighbors[i],

                    target,

                    depth - 1
                );



            if (found) {
                return true;
            }
        }



        return false;
    }



    function getConnections(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return adjacencyList[tokenId];
    }



    function hasDirectConnection(

        uint256 fromToken,

        uint256 toToken

    )
        external
        view
        returns(bool)
    {
        return directConnection[
            fromToken
        ][toToken];
    }



    function isSuspicious(
        uint256 tokenId
    )
        external
        view
        returns(bool)
    {
        return suspiciousIdentity[tokenId];
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



        directConnection[
            endorsement.fromToken
        ][endorsement.toToken]
            = false;
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



    function getNeighborCount(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            adjacencyList[tokenId]
                .length;
    }



    function detectTwoWayLoop(

        uint256 tokenA,

        uint256 tokenB

    )
        external
        view
        returns(bool)
    {

        return (

            directConnection[tokenA][tokenB]

            &&

            directConnection[tokenB][tokenA]
        );
    }



    function detectThreeNodeLoop(

        uint256 a,

        uint256 b,

        uint256 c

    )
        external
        view
        returns(bool)
    {

        return (

            directConnection[a][b]

            &&

            directConnection[b][c]

            &&

            directConnection[c][a]
        );
    }
}