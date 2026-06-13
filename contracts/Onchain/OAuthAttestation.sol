// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OAuthAttestation {
    string public moduleTopic = "oauth attestation";
    address public admin;

    struct Attestation {
        string provider;
        bytes32 codeChallenge;
        bool verified;
    }

    mapping(address => Attestation) public attestations;

    constructor() {
        admin = msg.sender;
    }

    function submitChallenge(string calldata provider, bytes32 challenge) external {
        attestations[msg.sender] = Attestation({
            provider: provider,
            codeChallenge: challenge,
            verified: false
        });
    }
}
