// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustGraphManager {

    struct Edge {

        uint256 fromToken;

        uint256 toToken;

        uint256 weight;

        uint256 timestamp;

        bool active;

        string relationType;
    }



    uint256 public edgeCounter;



    mapping(uint256 => Edge)
        public edges;



    mapping(uint256 => uint256[])
        internal forwardAdjacency;



    mapping(uint256 => uint256[])
        internal reverseAdjacency;



    mapping(uint256 => mapping(uint256 => bool))
        public connectionExists;



    mapping(uint256 => uint256)
        public outgoingEdgeCount;



    mapping(uint256 => uint256)
        public incomingEdgeCount;



    mapping(uint256 => bool)
        public indexedNode;



    uint256[] public indexedTokens;



    event EdgeCreated(
        uint256 indexed edgeId,
        uint256 indexed fromToken,
        uint256 indexed toToken,
        string relationType
    );



    event EdgeRemoved(
        uint256 indexed edgeId,
        uint256 indexed fromToken,
        uint256 indexed toToken
    );



    event NodeIndexed(
        uint256 indexed tokenId
    );



    function createConnection(

        uint256 fromToken,

        uint256 toToken,

        uint256 weight,

        string calldata relationType

    ) external {

        require(
            fromToken != toToken,
            "Self connection"
        );

        require(
            !connectionExists[fromToken][toToken],
            "Connection exists"
        );



        edgeCounter++;

        uint256 edgeId =
            edgeCounter;



        edges[edgeId] = Edge({

            fromToken: fromToken,

            toToken: toToken,

            weight: weight,

            timestamp: block.timestamp,

            active: true,

            relationType: relationType
        });



        forwardAdjacency[fromToken]
            .push(toToken);

        reverseAdjacency[toToken]
            .push(fromToken);



        connectionExists[fromToken][toToken]
            = true;



        outgoingEdgeCount[fromToken]++;

        incomingEdgeCount[toToken]++;



        if (!indexedNode[fromToken]) {

            indexedNode[fromToken]
                = true;

            indexedTokens.push(fromToken);

            emit NodeIndexed(fromToken);
        }



        if (!indexedNode[toToken]) {

            indexedNode[toToken]
                = true;

            indexedTokens.push(toToken);

            emit NodeIndexed(toToken);
        }



        emit EdgeCreated(
            edgeId,
            fromToken,
            toToken,
            relationType
        );
    }



    function removeConnection(

        uint256 edgeId

    ) external {

        Edge storage edge =
            edges[edgeId];



        require(
            edge.active,
            "Already removed"
        );



        edge.active = false;



        connectionExists[
            edge.fromToken
        ][edge.toToken] = false;



        if (
            outgoingEdgeCount[
                edge.fromToken
            ] > 0
        ) {
            outgoingEdgeCount[
                edge.fromToken
            ]--;
        }



        if (
            incomingEdgeCount[
                edge.toToken
            ] > 0
        ) {
            incomingEdgeCount[
                edge.toToken
            ]--;
        }



        emit EdgeRemoved(
            edgeId,
            edge.fromToken,
            edge.toToken
        );
    }



    function getOutgoingConnections(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return
            forwardAdjacency[tokenId];
    }



    function getIncomingConnections(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {
        return
            reverseAdjacency[tokenId];
    }



    function getNeighborCount(
        uint256 tokenId
    )
        external
        view
        returns(
            uint256 outgoing,
            uint256 incoming
        )
    {
        return (
            outgoingEdgeCount[tokenId],
            incomingEdgeCount[tokenId]
        );
    }



    function hasConnection(

        uint256 fromToken,

        uint256 toToken

    )
        external
        view
        returns(bool)
    {
        return
            connectionExists[
                fromToken
            ][toToken];
    }



    function getIndexedTokens()
        external
        view
        returns(uint256[] memory)
    {
        return indexedTokens;
    }



    function getTrustScore(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {

        uint256 outgoing =
            outgoingEdgeCount[tokenId];

        uint256 incoming =
            incomingEdgeCount[tokenId];



        return
            incoming * 2
            + outgoing;
    }



    function getSecondDegreeConnections(
        uint256 tokenId
    )
        external
        view
        returns(uint256[] memory)
    {

        uint256[] memory firstLevel =
            forwardAdjacency[tokenId];



        uint256 maxSize =
            firstLevel.length * 10;



        uint256[] memory temp =
            new uint256[](maxSize);



        uint256 counter;



        for (
            uint256 i = 0;
            i < firstLevel.length;
            i++
        ) {

            uint256 neighbor =
                firstLevel[i];



            uint256[] memory secondLevel =
                forwardAdjacency[neighbor];



            for (
                uint256 j = 0;
                j < secondLevel.length;
                j++
            ) {

                temp[counter] =
                    secondLevel[j];

                counter++;
            }
        }



        uint256[] memory result =
            new uint256[](counter);



        for (
            uint256 i = 0;
            i < counter;
            i++
        ) {
            result[i] = temp[i];
        }



        return result;
    }



    function getConnectionWeight(
        uint256 edgeId
    )
        external
        view
        returns(uint256)
    {
        return edges[edgeId].weight;
    }



    function getConnectionType(
        uint256 edgeId
    )
        external
        view
        returns(string memory)
    {
        return edges[edgeId].relationType;
    }



    function getEdge(
        uint256 edgeId
    )
        external
        view
        returns(Edge memory)
    {
        return edges[edgeId];
    }
}