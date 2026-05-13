// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract IdentityRegistry is ERC721 {



    uint256 public tokenCounter;



    mapping(address => uint256)
        public walletToTokenId;



    mapping(uint256 => bool)
        public burnedIdentities;



    mapping(uint256 => address)
        public originalOwner;



    event IdentityMinted(
        uint256 indexed tokenId,
        address indexed owner
    );



    event IdentityBurned(
        uint256 indexed tokenId,
        address indexed owner
    );



    constructor()
        ERC721(
            "DecentralizedIdentity",
            "DID"
        )
    {}



    function mintIdentity()
        external
    {

        require(
            walletToTokenId[msg.sender]
                == 0,
            "Identity exists"
        );



        tokenCounter++;

        uint256 tokenId =
            tokenCounter;



        _safeMint(
            msg.sender,
            tokenId
        );



        walletToTokenId[msg.sender]
            = tokenId;



        originalOwner[tokenId]
            = msg.sender;



        burnedIdentities[tokenId]
            = false;



        emit IdentityMinted(
            tokenId,
            msg.sender
        );
    }



    function burnIdentity(
        uint256 tokenId
    ) external {

        require(
            ownerOf(tokenId)
                == msg.sender,
            "Not owner"
        );



        address owner =
            ownerOf(tokenId);



        /*
        |--------------------------------------------------------------------------
        | FIX:
        | Clear stale wallet mapping
        |--------------------------------------------------------------------------
        */

        delete walletToTokenId[owner];



        burnedIdentities[tokenId]
            = true;



        _burn(tokenId);



        emit IdentityBurned(
            tokenId,
            owner
        );
    }



    function remintIdentity()
        external
    {

        require(
            walletToTokenId[msg.sender]
                == 0,
            "Existing identity"
        );



        tokenCounter++;

        uint256 tokenId =
            tokenCounter;



        _safeMint(
            msg.sender,
            tokenId
        );



        walletToTokenId[msg.sender]
            = tokenId;



        originalOwner[tokenId]
            = msg.sender;



        emit IdentityMinted(
            tokenId,
            msg.sender
        );
    }



    function hasIdentity(
        address user
    )
        external
        view
        returns(bool)
    {
        return
            walletToTokenId[user]
                != 0;
    }



    function getIdentity(
        address user
    )
        external
        view
        returns(uint256)
    {
        return walletToTokenId[user];
    }



    function isBurned(
        uint256 tokenId
    )
        external
        view
        returns(bool)
    {
        return burnedIdentities[tokenId];
    }



    function identityExists(
        uint256 tokenId
    )
        external
        view
        returns(bool)
    {
        return _ownerOf(tokenId)
            != address(0);
    }



    function recoverStaleMapping(
        address user
    ) external {

        uint256 tokenId =
            walletToTokenId[user];



        if (
            tokenId != 0 &&
            _ownerOf(tokenId)
                == address(0)
        ) {

            delete walletToTokenId[user];
        }
    }



    function syncOwnershipState(
        address user
    ) external {

        uint256 tokenId =
            walletToTokenId[user];



        if (
            tokenId != 0 &&
            burnedIdentities[tokenId]
        ) {

            delete walletToTokenId[user];
        }
    }
}