// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EndorsementManager {
    string public moduleTopic = "Endorsements";
    address public admin;

    struct Endorsement {
        address endorser;
        bytes32 claimHash;
        uint256 timestamp;
    }

    mapping(bytes32 => Endorsement[]) public endorsements;

    event ClaimEndorsed(address indexed endorser, bytes32 indexed claimHash);

    constructor() {
        admin = msg.sender;
    }

    function endorse(bytes32 claimHash, bytes calldata signature) external {
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", claimHash));
        address signer = recoverSigner(messageHash, signature);
        require(signer != address(0), "Invalid signature");

        endorsements[claimHash].push(Endorsement({
            endorser: signer,
            claimHash: claimHash,
            timestamp: block.timestamp
        }));

        emit ClaimEndorsed(signer, claimHash);
    }

    function recoverSigner(bytes32 messageHash, bytes memory signature) public pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        return ecrecover(messageHash, v, r, s);
    }
}
