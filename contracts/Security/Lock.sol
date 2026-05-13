// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DynamicMetadataStorage is AccessControl {



    bytes32 public constant
        METADATA_MANAGER_ROLE =
        keccak256(
            "METADATA_MANAGER_ROLE"
        );



    uint256 public constant
        MAX_KEYS = 25;

    uint256 public constant
        MAX_VALUE_SIZE = 96;

    uint256 public constant
        MAX_UPDATES = 100;



    struct PackedMetadataInfo {

        uint64 createdAt;

        uint64 updatedAt;

        uint32 updateCount;

        bool frozen;

        bool initialized;
    }



    struct HybridStorageLink {

        string ipfsCID;

        string arweaveId;

        uint64 linkedAt;

        bool active;
    }



    struct MetadataNamespace {

        bytes32 namespace;

        bool enabled;

        uint32 maxKeys;
    };



    mapping(bytes32 => bool)
        public whitelistedKeys;



    mapping(bytes32 => MetadataNamespace)
        public namespaces;



    mapping(uint256 => PackedMetadataInfo)
        public metadataInfo;



    mapping(uint256 => HybridStorageLink)
        public hybridLinks;



    mapping(uint256 => bytes32[])
        internal tokenKeys;



    mapping(uint256 => mapping(bytes32 => string))
        internal metadataValues;



    mapping(uint256 => mapping(bytes32 => bool))
        internal keyExists;



    mapping(uint256 => mapping(bytes32 => uint64))
        public keyLastUpdated;



    event MetadataSet(
        uint256 indexed tokenId,
        bytes32 indexed key,
        string value
    );



    event MetadataRemoved(
        uint256 indexed tokenId,
        bytes32 indexed key
    );



    event NamespaceCreated(
        bytes32 indexed namespace
    );



    event OffchainLinkUpdated(
        uint256 indexed tokenId,
        string ipfsCID
    );



    event MetadataFrozen(
        uint256 indexed tokenId
    );



    constructor() {

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            METADATA_MANAGER_ROLE,
            msg.sender
        );
    }



    function whitelistKey(
        bytes32 key
    )
        external
        onlyRole(
            METADATA_MANAGER_ROLE
        )
    {
        whitelistedKeys[key] = true;
    }



    function createNamespace(

        bytes32 namespace,

        uint32 maxKeys

    )
        external
        onlyRole(
            METADATA_MANAGER_ROLE
        )
    {

        namespaces[namespace]
            = MetadataNamespace({

                namespace: namespace,

                enabled: true,

                maxKeys: maxKeys
            });



        emit NamespaceCreated(
            namespace
        );
    }



    function setMetadata(

        uint256 tokenId,

        bytes32 key,

        string calldata value

    ) external {

        require(
            whitelistedKeys[key],
            "Key not allowed"
        );

        require(
            bytes(value).length
                <= MAX_VALUE_SIZE,
            "Value too large"
        );



        PackedMetadataInfo
            storage info =
                metadataInfo[tokenId];



        require(
            !info.frozen,
            "Metadata frozen"
        );

        require(
            info.updateCount
                < MAX_UPDATES,
            "Update limit reached"
        );



        if (!keyExists[tokenId][key]) {

            require(
                tokenKeys[tokenId].length
                    < MAX_KEYS,
                "Key limit reached"
            );

            tokenKeys[tokenId]
                .push(key);

            keyExists[tokenId][key]
                = true;
        }



        metadataValues[tokenId][key]
            = value;



        keyLastUpdated[tokenId][key]
            = uint64(block.timestamp);



        if (!info.initialized) {

            info.createdAt =
                uint64(block.timestamp);

            info.initialized = true;
        }



        info.updatedAt =
            uint64(block.timestamp);

        info.updateCount++;



        emit MetadataSet(
            tokenId,
            key,
            value
        );
    }



    function batchSetMetadata(

        uint256 tokenId,

        bytes32[] calldata keys,

        string[] calldata values

    ) external {

        require(
            keys.length == values.length,
            "Length mismatch"
        );



        PackedMetadataInfo
            storage info =
                metadataInfo[tokenId];



        require(
            !info.frozen,
            "Frozen metadata"
        );



        uint256 length =
            keys.length;



        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            bytes32 key = keys[i];

            string calldata value =
                values[i];



            require(
                whitelistedKeys[key],
                "Invalid key"
            );



            require(
                bytes(value).length
                    <= MAX_VALUE_SIZE,
                "Large value"
            );



            if (
                !keyExists[tokenId][key]
            ) {

                tokenKeys[tokenId]
                    .push(key);

                keyExists[tokenId][key]
                    = true;
            }



            metadataValues[tokenId][key]
                = value;



            keyLastUpdated[tokenId][key]
                = uint64(block.timestamp);



            emit MetadataSet(
                tokenId,
                key,
                value
            );
        }



        info.updatedAt =
            uint64(block.timestamp);

        info.updateCount +=
            uint32(length);
    }



    function removeMetadata(

        uint256 tokenId,

        bytes32 key

    ) external {

        require(
            keyExists[tokenId][key],
            "Key missing"
        );



        delete metadataValues[tokenId][key];



        keyExists[tokenId][key]
            = false;



        emit MetadataRemoved(
            tokenId,
            key
        );
    }



    function freezeMetadata(
        uint256 tokenId
    ) external {

        metadataInfo[tokenId]
            .frozen = true;



        emit MetadataFrozen(
            tokenId
        );
    }



    function updateHybridStorage(

        uint256 tokenId,

        string calldata ipfsCID,

        string calldata arweaveId

    ) external {

        hybridLinks[tokenId]
            = HybridStorageLink({

                ipfsCID: ipfsCID,

                arweaveId: arweaveId,

                linkedAt:
                    uint64(block.timestamp),

                active: true
            });



        emit OffchainLinkUpdated(
            tokenId,
            ipfsCID
        );
    }



    function disableHybridStorage(
        uint256 tokenId
    ) external {

        hybridLinks[tokenId]
            .active = false;
    }



    function getMetadata(

        uint256 tokenId,

        bytes32 key

    )
        external
        view
        returns(string memory)
    {
        return
            metadataValues[tokenId][key];
    }



    function getMetadataKeys(
        uint256 tokenId
    )
        external
        view
        returns(bytes32[] memory)
    {
        return tokenKeys[tokenId];
    }



    function getMetadataInfo(
        uint256 tokenId
    )
        external
        view
        returns(
            PackedMetadataInfo memory
        )
    {
        return metadataInfo[tokenId];
    }



    function getHybridStorage(
        uint256 tokenId
    )
        external
        view
        returns(
            HybridStorageLink memory
        )
    {
        return hybridLinks[tokenId];
    }



    function metadataKeyExists(

        uint256 tokenId,

        bytes32 key

    )
        external
        view
        returns(bool)
    {
        return keyExists[tokenId][key];
    }



    function getUpdateTimestamp(

        uint256 tokenId,

        bytes32 key

    )
        external
        view
        returns(uint64)
    {
        return
            keyLastUpdated[tokenId][key];
    }
}