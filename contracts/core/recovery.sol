// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


contract SignatureBackupRecovery
    is AccessControl
{

    using ECDSA for bytes32;



    bytes32 public constant
        SECURITY_ADMIN_ROLE =
        keccak256(
            "SECURITY_ADMIN_ROLE"
        );



    uint256 public constant
        RECOVERY_DELAY =
        3 days;



    uint256 public constant
        MAX_BACKUPS = 5;



    uint256 public constant
        REQUIRED_SIGNATURES = 3;



    uint256 public recoveryCounter;



    enum RecoveryStatus {
        NONE,
        PENDING,
        EXECUTED,
        CANCELLED,
        ESCALATED
    }



    struct RecoveryRequest {

        uint256 requestId;

        uint256 tokenId;

        address oldWallet;

        address newWallet;

        uint256 createdAt;

        uint256 executeAfter;

        bool executed;

        bool cancelled;

        bool escalated;

        uint256 signatureCount;

        RecoveryStatus status;
    }



    struct CompromiseReport {

        uint256 tokenId;

        address reporter;

        string reason;

        uint256 timestamp;

        bool resolved;
    };



    mapping(uint256 => address[])
        public backupWallets;



    mapping(uint256 => mapping(address => bool))
        public approvedBackups;



    mapping(uint256 => RecoveryRequest)
        public recoveryRequests;



    mapping(uint256 => mapping(address => bool))
        public signedRecovery;



    mapping(uint256 => bool)
        public compromisedIdentity;



    mapping(uint256 => bool)
        public emergencyFrozen;



    mapping(uint256 => CompromiseReport[])
        public compromiseReports;



    mapping(bytes32 => bool)
        public usedSignatures;



    event RecoveryRequested(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        address oldWallet,
        address newWallet
    );



    event RecoverySigned(
        uint256 indexed requestId,
        address signer
    );



    event RecoveryExecuted(
        uint256 indexed requestId
    );



    event RecoveryCancelled(
        uint256 indexed requestId
    );



    event RecoveryEscalated(
        uint256 indexed requestId
    );



    event IdentityCompromised(
        uint256 indexed tokenId
    );



    event EmergencyFreeze(
        uint256 indexed tokenId
    );



    constructor() {

        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );

        _grantRole(
            SECURITY_ADMIN_ROLE,
            msg.sender
        );
    }



    /*
    |--------------------------------------------------------------------------
    | REGISTER BACKUP WALLETS
    |--------------------------------------------------------------------------
    */

    function registerBackupWallets(

        uint256 tokenId,

        address[] calldata backups

    ) external {

        require(
            backups.length
                <= MAX_BACKUPS,
            "Too many backups"
        );



        delete backupWallets[tokenId];



        for (
            uint256 i = 0;
            i < backups.length;
            i++
        ) {

            require(
                backups[i]
                    != address(0),
                "Invalid wallet"
            );

            backupWallets[tokenId]
                .push(backups[i]);



            approvedBackups[tokenId]
                [backups[i]]
                    = true;
        }
    }



    /*
    |--------------------------------------------------------------------------
    | REQUEST RECOVERY
    |--------------------------------------------------------------------------
    |
    | Starts delayed recovery process.
    |
    */

    function requestRecovery(

        uint256 tokenId,

        address oldWallet,

        address newWallet

    ) external {

        require(
            approvedBackups[tokenId]
                [msg.sender],
            "Not approved backup"
        );



        require(
            !emergencyFrozen[tokenId],
            "Identity frozen"
        );



        recoveryCounter++;



        RecoveryRequest storage req =
            recoveryRequests[
                recoveryCounter
            ];



        req.requestId =
            recoveryCounter;

        req.tokenId =
            tokenId;

        req.oldWallet =
            oldWallet;

        req.newWallet =
            newWallet;

        req.createdAt =
            block.timestamp;

        req.executeAfter =
            block.timestamp
            + RECOVERY_DELAY;

        req.status =
            RecoveryStatus.PENDING;



        emit RecoveryRequested(
            recoveryCounter,
            tokenId,
            oldWallet,
            newWallet
        );
    }



    /*
    |--------------------------------------------------------------------------
    | SIGN RECOVERY
    |--------------------------------------------------------------------------
    |
    | Multi-sig approval collection.
    |
    */

    function signRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[
                requestId
            ];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Not pending"
        );



        require(
            approvedBackups[
                req.tokenId
            ][msg.sender],
            "Not backup signer"
        );



        require(
            !signedRecovery[
                requestId
            ][msg.sender],
            "Already signed"
        );



        signedRecovery[
            requestId
        ][msg.sender] = true;



        req.signatureCount++;



        emit RecoverySigned(
            requestId,
            msg.sender
        );
    }



    /*
    |--------------------------------------------------------------------------
    | EXECUTE RECOVERY
    |--------------------------------------------------------------------------
    |
    | Can only execute:
    |
    | 1. After delay
    | 2. Enough signatures
    | 3. Not cancelled
    |
    */

    function executeRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[
                requestId
            ];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Invalid status"
        );



        require(
            block.timestamp
                >= req.executeAfter,
            "Delay not completed"
        );



        require(
            req.signatureCount
                >= REQUIRED_SIGNATURES,
            "Insufficient signatures"
        );



        require(
            !req.cancelled,
            "Recovery cancelled"
        );



        require(
            !req.executed,
            "Already executed"
        );



        req.executed = true;

        req.status =
            RecoveryStatus.EXECUTED;



        compromisedIdentity[
            req.tokenId
        ] = false;



        emit RecoveryExecuted(
            requestId
        );
    }



    /*
    |--------------------------------------------------------------------------
    | CANCEL RECOVERY
    |--------------------------------------------------------------------------
    |
    | Current wallet owner can stop
    | malicious recovery attempt.
    |
    */

    function cancelRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[
                requestId
            ];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Invalid request"
        );



        require(
            msg.sender
                == req.oldWallet,
            "Only old wallet"
        );



        req.cancelled = true;

        req.status =
            RecoveryStatus.CANCELLED;



        emit RecoveryCancelled(
            requestId
        );
    }



    /*
    |--------------------------------------------------------------------------
    | REPORT COMPROMISE
    |--------------------------------------------------------------------------
    */

    function reportCompromise(

        uint256 tokenId,

        string calldata reason

    ) external {

        compromisedIdentity[
            tokenId
        ] = true;



        compromiseReports[
            tokenId
        ].push(

            CompromiseReport({

                tokenId: tokenId,

                reporter: msg.sender,

                reason: reason,

                timestamp: block.timestamp,

                resolved: false
            })
        );



        emit IdentityCompromised(
            tokenId
        );
    }



    /*
    |--------------------------------------------------------------------------
    | ESCALATE RECOVERY
    |--------------------------------------------------------------------------
    |
    | Admin intervention for suspicious
    | recovery activity.
    |
    */

    function escalateRecovery(
        uint256 requestId
    )
        external
        onlyRole(
            SECURITY_ADMIN_ROLE
        )
    {

        RecoveryRequest storage req =
            recoveryRequests[
                requestId
            ];



        req.escalated = true;

        req.status =
            RecoveryStatus.ESCALATED;



        emergencyFrozen[
            req.tokenId
        ] = true;



        emit RecoveryEscalated(
            requestId
        );



        emit EmergencyFreeze(
            req.tokenId
        );
    }



    /*
    |--------------------------------------------------------------------------
    | UNFREEZE IDENTITY
    |--------------------------------------------------------------------------
    */

    function unfreezeIdentity(
        uint256 tokenId
    )
        external
        onlyRole(
            SECURITY_ADMIN_ROLE
        )
    {
        emergencyFrozen[
            tokenId
        ] = false;
    }



    /*
    |--------------------------------------------------------------------------
    | VERIFY SIGNATURE
    |--------------------------------------------------------------------------
    |
    | Extra cryptographic validation.
    |
    */

    function verifySignature(

        bytes32 messageHash,

        bytes memory signature,

        address expectedSigner

    )
        public
        pure
        returns(bool)
    {

        bytes32 ethSignedMessage =
            messageHash
                .toEthSignedMessageHash();



        address recovered =
            ethSignedMessage
                .recover(signature);



        return
            recovered
                == expectedSigner;
    }



    /*
    |--------------------------------------------------------------------------
    | REPLAY PROTECTION
    |--------------------------------------------------------------------------
    */

    function consumeSignature(
        bytes32 sigHash
    ) external {

        require(
            !usedSignatures[sigHash],
            "Signature already used"
        );



        usedSignatures[
            sigHash
        ] = true;
    }



    /*
    |--------------------------------------------------------------------------
    | GET BACKUP COUNT
    |--------------------------------------------------------------------------
    */

    function getBackupCount(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            backupWallets[tokenId]
                .length;
    }



    /*
    |--------------------------------------------------------------------------
    | GET REPORT COUNT
    |--------------------------------------------------------------------------
    */

    function getCompromiseReportCount(
        uint256 tokenId
    )
        external
        view
        returns(uint256)
    {
        return
            compromiseReports[tokenId]
                .length;
    }
}