// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SecureRecoveryManager {

    using ECDSA for bytes32;



    uint256 public constant
        RECOVERY_DELAY = 2 days;

    uint256 public constant
        REQUIRED_SIGNATURES = 2;



    uint256 public requestCounter;



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

        uint256 approvals;

        bool executed;

        bool cancelled;

        bool escalated;

        RecoveryStatus status;
    }



    struct CompromiseReport {

        address reporter;

        string reason;

        uint256 timestamp;
    };



    mapping(uint256 => address[])
        public backupWallets;

    mapping(uint256 => mapping(address => bool))
        public approvedBackup;

    mapping(uint256 => RecoveryRequest)
        public recoveryRequests;

    mapping(uint256 => mapping(address => bool))
        public signedRecovery;

    mapping(uint256 => bool)
        public compromisedIdentity;

    mapping(uint256 => bool)
        public emergencyFreeze;

    mapping(uint256 => CompromiseReport[])
        public compromiseReports;



    event RecoveryRequested(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        address oldWallet,
        address newWallet
    );

    event RecoveryApproved(
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



    function registerBackupWallets(

        uint256 tokenId,

        address[] calldata wallets

    ) external {

        delete backupWallets[tokenId];



        uint256 length = wallets.length;

        for (
            uint256 i = 0;
            i < length;
            i++
        ) {

            address wallet = wallets[i];

            require(
                wallet != address(0),
                "Invalid wallet"
            );

            backupWallets[tokenId]
                .push(wallet);

            approvedBackup[tokenId][wallet]
                = true;
        }
    }



    function requestRecovery(

        uint256 tokenId,

        address oldWallet,

        address newWallet

    ) external {

        require(
            approvedBackup[tokenId][msg.sender],
            "Not backup wallet"
        );

        require(
            !emergencyFreeze[tokenId],
            "Identity frozen"
        );



        requestCounter++;

        uint256 requestId =
            requestCounter;



        RecoveryRequest storage req =
            recoveryRequests[requestId];



        req.requestId =
            requestId;

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
            requestId,
            tokenId,
            oldWallet,
            newWallet
        );
    }



    function approveRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[requestId];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Not pending"
        );

        require(
            approvedBackup[
                req.tokenId
            ][msg.sender],
            "Unauthorized signer"
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



        req.approvals++;



        emit RecoveryApproved(
            requestId,
            msg.sender
        );
    }



    function executeRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[requestId];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Invalid status"
        );

        require(
            block.timestamp
                >= req.executeAfter,
            "Recovery delay active"
        );

        require(
            req.approvals
                >= REQUIRED_SIGNATURES,
            "Not enough approvals"
        );

        require(
            !req.executed,
            "Already executed"
        );

        require(
            !req.cancelled,
            "Recovery cancelled"
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



    function cancelRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[requestId];



        require(
            req.status
                == RecoveryStatus.PENDING,
            "Invalid request"
        );

        require(
            msg.sender
                == req.oldWallet,
            "Only owner"
        );



        req.cancelled = true;

        req.status =
            RecoveryStatus.CANCELLED;



        emit RecoveryCancelled(
            requestId
        );
    }



    function reportCompromise(

        uint256 tokenId,

        string calldata reason

    ) external {

        compromisedIdentity[tokenId]
            = true;



        compromiseReports[tokenId]
            .push(

                CompromiseReport({

                    reporter: msg.sender,

                    reason: reason,

                    timestamp: block.timestamp
                })
            );



        emit IdentityCompromised(
            tokenId
        );
    }



    function escalateRecovery(
        uint256 requestId
    ) external {

        RecoveryRequest storage req =
            recoveryRequests[requestId];



        require(
            compromisedIdentity[
                req.tokenId
            ],
            "No compromise detected"
        );



        req.escalated = true;

        req.status =
            RecoveryStatus.ESCALATED;



        emergencyFreeze[
            req.tokenId
        ] = true;



        emit RecoveryEscalated(
            requestId
        );
    }



    function verifySignature(

        bytes32 messageHash,

        bytes memory signature,

        address signer

    )
        public
        pure
        returns(bool)
    {

        bytes32 ethSignedHash =
            messageHash
                .toEthSignedMessageHash();



        return
            ethSignedHash
                .recover(signature)
                    == signer;
    }



    function getBackupWallets(
        uint256 tokenId
    )
        external
        view
        returns(address[] memory)
    {
        return backupWallets[tokenId];
    }



    function getCompromiseReports(
        uint256 tokenId
    )
        external
        view
        returns(
            CompromiseReport[] memory
        )
    {
        return compromiseReports[tokenId];
    }
}