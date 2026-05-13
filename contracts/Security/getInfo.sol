// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CompromisedIdentityGuard {



    enum IdentityStatus {
        ACTIVE,
        COMPROMISED,
        FROZEN,
        RECOVERING,
        RECOVERED
    }



    struct IdentitySecurity {

        IdentityStatus status;

        uint64 compromisedAt;

        uint64 recoveredAt;

        uint64 frozenAt;

        bool externalUsageBlocked;

        string compromiseReason;
    }



    mapping(uint256 => IdentitySecurity)
        public identitySecurity;



    mapping(address => bool)
        public approvedApplications;



    mapping(uint256 => mapping(address => bool))
        public temporaryAccess;



    event IdentityCompromised(
        uint256 indexed tokenId,
        string reason
    );



    event IdentityFrozen(
        uint256 indexed tokenId
    );



    event IdentityRecovered(
        uint256 indexed tokenId
    );



    event ExternalUsageBlocked(
        uint256 indexed tokenId
    );



    event ApplicationApproved(
        address indexed app
    );



    modifier onlyActiveIdentity(
        uint256 tokenId
    ) {

        require(
            identitySecurity[tokenId]
                .status
                    ==
                IdentityStatus.ACTIVE,
            "Identity not active"
        );

        _;
    }



    function approveApplication(
        address app
    ) external {

        approvedApplications[app]
            = true;



        emit ApplicationApproved(
            app
        );
    }



    function markCompromised(

        uint256 tokenId,

        string calldata reason

    ) external {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        security.status =
            IdentityStatus.COMPROMISED;

        security.compromisedAt =
            uint64(block.timestamp);

        security.externalUsageBlocked =
            true;

        security.compromiseReason =
            reason;



        emit IdentityCompromised(
            tokenId,
            reason
        );



        emit ExternalUsageBlocked(
            tokenId
        );
    }



    function freezeIdentity(
        uint256 tokenId
    ) external {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        security.status =
            IdentityStatus.FROZEN;

        security.frozenAt =
            uint64(block.timestamp);

        security.externalUsageBlocked =
            true;



        emit IdentityFrozen(
            tokenId
        );
    }



    function beginRecovery(
        uint256 tokenId
    ) external {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        require(
            security.status
                ==
            IdentityStatus.COMPROMISED,
            "Not compromised"
        );



        security.status =
            IdentityStatus.RECOVERING;
    }



    function completeRecovery(
        uint256 tokenId
    ) external {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        require(
            security.status
                ==
            IdentityStatus.RECOVERING,
            "Not recovering"
        );



        security.status =
            IdentityStatus.RECOVERED;

        security.recoveredAt =
            uint64(block.timestamp);

        security.externalUsageBlocked =
            false;



        emit IdentityRecovered(
            tokenId
        );
    }



    function restoreActiveStatus(
        uint256 tokenId
    ) external {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        require(
            security.status
                ==
            IdentityStatus.RECOVERED,
            "Not recovered"
        );



        security.status =
            IdentityStatus.ACTIVE;
    }



    function grantTemporaryAccess(

        uint256 tokenId,

        address app

    ) external {

        require(
            approvedApplications[app],
            "Unapproved app"
        );



        temporaryAccess[tokenId][app]
            = true;
    }



    function revokeTemporaryAccess(

        uint256 tokenId,

        address app

    ) external {

        temporaryAccess[tokenId][app]
            = false;
    }



    function canUseIdentity(

        uint256 tokenId,

        address app

    )
        external
        view
        returns(bool)
    {

        IdentitySecurity
            storage security =
                identitySecurity[tokenId];



        if (
            security.status
                ==
            IdentityStatus.ACTIVE
        ) {
            return true;
        }



        if (
            security.externalUsageBlocked
        ) {

            return temporaryAccess[
                tokenId
            ][app];
        }



        return false;
    }



    function isCompromised(
        uint256 tokenId
    )
        external
        view
        returns(bool)
    {
        return (
            identitySecurity[tokenId]
                .status
                    ==
            IdentityStatus.COMPROMISED
        );
    }



    function getIdentityStatus(
        uint256 tokenId
    )
        external
        view
        returns(IdentityStatus)
    {
        return
            identitySecurity[tokenId]
                .status;
    }



    function getSecurityInfo(
        uint256 tokenId
    )
        external
        view
        returns(
            IdentitySecurity memory
        )
    {
        return identitySecurity[tokenId];
    }
}