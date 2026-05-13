// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GaslessEndorsementManager {

    using ECDSA for bytes32;



    bytes32 public immutable DOMAIN_SEPARATOR;



    bytes32 public constant
        ENDORSEMENT_TYPEHASH =
        keccak256(
            "Endorsement(uint256 fromToken,uint256 toToken,uint256 nonce,uint256 deadline)"
        );



    struct Endorsement {

        uint256 fromToken;

        uint256 toToken;

        address signer;

        uint256 timestamp;

        bool active;
    };



    uint256 public endorsementCounter;



    mapping(uint256 => Endorsement)
        public endorsements;



    /*
    |--------------------------------------------------------------------------
    | NONCE-BASED REPLAY PROTECTION
    |--------------------------------------------------------------------------
    |
    | Every signer has a unique nonce.
    | Signature becomes invalid after use.
    |
    */

    mapping(address => uint256)
        public nonces;



    mapping(bytes32 => bool)
        public usedDigests;



    event EndorsementSubmitted(
        uint256 indexed endorsementId,
        uint256 indexed fromToken,
        uint256 indexed toToken,
        address signer
    );



    event NonceConsumed(
        address indexed signer,
        uint256 nonce
    );



    constructor() {

        uint256 chainId;

        assembly {
            chainId := chainid()
        }



        DOMAIN_SEPARATOR =
            keccak256(

                abi.encode(

                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),

                    keccak256(
                        bytes(
                            "GaslessEndorsementManager"
                        )
                    ),

                    keccak256(
                        bytes("1")
                    ),

                    chainId,

                    address(this)
                )
            );
    }



    function submitGaslessEndorsement(

        uint256 fromToken,

        uint256 toToken,

        uint256 deadline,

        bytes calldata signature

    ) external {

        require(
            block.timestamp <= deadline,
            "Signature expired"
        );



        address signer =
            _recoverSigner(

                fromToken,

                toToken,

                nonces[msg.sender],

                deadline,

                signature
            );



        require(
            signer != address(0),
            "Invalid signer"
        );



        uint256 currentNonce =
            nonces[signer];



        bytes32 digest =
            _buildDigest(

                fromToken,

                toToken,

                currentNonce,

                deadline
            );



        /*
        |--------------------------------------------------------------------------
        | REPLAY PROTECTION
        |--------------------------------------------------------------------------
        */

        require(
            !usedDigests[digest],
            "Signature replay detected"
        );



        usedDigests[digest]
            = true;



        nonces[signer]++;



        endorsementCounter++;

        uint256 endorsementId =
            endorsementCounter;



        endorsements[endorsementId]
            = Endorsement({

                fromToken: fromToken,

                toToken: toToken,

                signer: signer,

                timestamp:
                    block.timestamp,

                active: true
            });



        emit EndorsementSubmitted(
            endorsementId,
            fromToken,
            toToken,
            signer
        );



        emit NonceConsumed(
            signer,
            currentNonce
        );
    }



    function _recoverSigner(

        uint256 fromToken,

        uint256 toToken,

        uint256 nonce,

        uint256 deadline,

        bytes memory signature

    )
        internal
        view
        returns(address)
    {

        bytes32 digest =
            _buildDigest(

                fromToken,

                toToken,

                nonce,

                deadline
            );



        return
            digest.recover(signature);
    }



    function _buildDigest(

        uint256 fromToken,

        uint256 toToken,

        uint256 nonce,

        uint256 deadline

    )
        internal
        view
        returns(bytes32)
    {

        bytes32 structHash =
            keccak256(

                abi.encode(

                    ENDORSEMENT_TYPEHASH,

                    fromToken,

                    toToken,

                    nonce,

                    deadline
                )
            );



        return
            keccak256(

                abi.encodePacked(

                    "\x19\x01",

                    DOMAIN_SEPARATOR,

                    structHash
                )
            );
    }



    function revokeEndorsement(
        uint256 endorsementId
    ) external {

        Endorsement storage endorsement =
            endorsements[endorsementId];



        require(
            endorsement.signer
                == msg.sender,
            "Unauthorized"
        );



        endorsement.active = false;
    }



    function getNonce(
        address user
    )
        external
        view
        returns(uint256)
    {
        return nonces[user];
    }



    function hasDigestBeenUsed(
        bytes32 digest
    )
        external
        view
        returns(bool)
    {
        return usedDigests[digest];
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



    function isEndorsementActive(
        uint256 endorsementId
    )
        external
        view
        returns(bool)
    {
        return endorsements[endorsementId]
            .active;
    }
}