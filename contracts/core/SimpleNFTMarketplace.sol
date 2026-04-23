// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ============================================================
    FILE: SimpleNFTMarketplace.sol
    ============================================================

    Topic:
    - NFT Marketplace
    - Listing & buying NFTs

    Features:
    - List NFT
    - Buy NFT
    - Cancel listing
*/

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract SimpleNFTMarketplace {

    struct Listing {
        address seller;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(address nft, uint256 tokenId, uint256 price);
    event Bought(address nft, uint256 tokenId, address buyer);
    event Cancelled(address nft, uint256 tokenId);

    // ============================================================
    // LIST NFT
    // ============================================================

    function listNFT(address nft, uint256 tokenId, uint256 price) external {
        require(price > 0, "Invalid price");

        listings[nft][tokenId] = Listing({
            seller: msg.sender,
            price: price
        });

        emit Listed(nft, tokenId, price);
    }

    // ============================================================
    // BUY NFT
    // ============================================================

    function buyNFT(address nft, uint256 tokenId) external payable {
        Listing memory item = listings[nft][tokenId];

        require(item.price > 0, "Not listed");
        require(msg.value >= item.price, "Low payment");

        delete listings[nft][tokenId];

        IERC721(nft).transferFrom(item.seller, msg.sender, tokenId);

        payable(item.seller).transfer(item.price);

        emit Bought(nft, tokenId, msg.sender);
    }

    // ============================================================
    // CANCEL LISTING
    // ============================================================

    function cancelListing(address nft, uint256 tokenId) external {
        Listing memory item = listings[nft][tokenId];

        require(item.seller == msg.sender, "Not owner");

        delete listings[nft][tokenId];

        emit Cancelled(nft, tokenId);
    }
}