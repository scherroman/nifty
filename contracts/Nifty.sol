// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

contract Nifty {
    error ListingPriceNotProvided();
    error ListingPriceNotPaid(uint price);
    error NotOwnerOfNft();
    error NftNotApprovedForMarketplace();
    error NftAlreadyListed();
    error NftNotListed();
    error NoProceedsToWithdraw();
    error WithdrawProceedsFailed();

    struct Listing {
        uint price;
        address seller;
        bool isOpen;
    }

    uint public numberOfListings = 0;
    mapping(address => mapping(uint => Listing))
        public listingByNftIdByNftAddress;
    mapping(address => uint) public proceeds;

    event NftListed(
        address indexed nftAddress,
        uint indexed nftId,
        uint price,
        address seller
    );
    event ListingUpdated(
        address indexed nftAddress,
        uint indexed nftId,
        uint price,
        address seller
    );
    event NftUnlisted(address indexed nftAddress, uint indexed nftId);
    event NftBought(
        address indexed nftAddress,
        uint indexed nftId,
        uint price,
        address buyer
    );

    modifier listingPriceProvided(uint price) {
        if (price == 0) {
            revert ListingPriceNotProvided();
        }
        _;
    }

    modifier listingPricePaid(
        address nftAddress,
        uint nftId,
        uint value
    ) {
        uint price = listingByNftIdByNftAddress[nftAddress][nftId].price;
        if (value < price) {
            revert ListingPriceNotPaid(price);
        }
        _;
    }

    modifier isNftOwner(
        address nftAddress,
        uint nftId,
        address user
    ) {
        if (IERC721(nftAddress).ownerOf(nftId) != user) {
            revert NotOwnerOfNft();
        }
        _;
    }

    modifier nftIsApproved(address nftAddress, uint nftId) {
        if (IERC721(nftAddress).getApproved(nftId) != address(this)) {
            revert NftNotApprovedForMarketplace();
        }
        _;
    }

    modifier nftIsUnlisted(address nftAddress, uint nftId) {
        if (listingByNftIdByNftAddress[nftAddress][nftId].isOpen) {
            revert NftAlreadyListed();
        }
        _;
    }

    modifier nftIsListed(address nftAddress, uint nftId) {
        if (listingByNftIdByNftAddress[nftAddress][nftId].price == 0) {
            revert NftNotListed();
        }
        _;
    }

    modifier hasProceeds(address user) {
        if (proceeds[user] == 0) {
            revert NoProceedsToWithdraw();
        }
        _;
    }

    /**
     * @notice Lists an NFT on the marketplace
     * @param nftAddress: The adress of the NFT contract
     * @param nftId: The id of the NFT
     * @param price: The asking price for the NFT
     */
    function listNft(
        address nftAddress,
        uint nftId,
        uint price
    )
        external
        listingPriceProvided(price)
        isNftOwner(nftAddress, nftId, msg.sender)
        nftIsApproved(nftAddress, nftId)
        nftIsUnlisted(nftAddress, nftId)
    {
        address seller = msg.sender;
        listingByNftIdByNftAddress[nftAddress][nftId] = Listing(
            price,
            seller,
            true // isOpen
        );
        numberOfListings++;

        emit NftListed(nftAddress, nftId, price, seller);
    }

    function updateListing(
        address nftAddress,
        uint nftId,
        uint price
    )
        external
        listingPriceProvided(price)
        isNftOwner(nftAddress, nftId, msg.sender)
        nftIsListed(nftAddress, nftId)
    {
        address seller = msg.sender;
        Listing storage listing = listingByNftIdByNftAddress[nftAddress][nftId];
        listing.price = price;
        listing.seller = seller;

        emit ListingUpdated(nftAddress, nftId, price, seller);
    }

    function unlistNft(
        address nftAddress,
        uint nftId
    )
        external
        isNftOwner(nftAddress, nftId, msg.sender)
        nftIsListed(nftAddress, nftId)
    {
        _unlistNft(nftAddress, nftId);
    }

    function _unlistNft(address nftAddress, uint nftId) private {
        delete listingByNftIdByNftAddress[nftAddress][nftId];
        numberOfListings--;

        emit NftUnlisted(nftAddress, nftId);
    }

    function buyNft(
        address nftAddress,
        uint nftId
    )
        external
        payable
        nftIsListed(nftAddress, nftId)
        listingPricePaid(nftAddress, nftId, msg.value)
    {
        address buyer = msg.sender;
        IERC721 nft = IERC721(nftAddress);
        Listing memory listing = listingByNftIdByNftAddress[nftAddress][nftId];
        uint initialSellerProceeds = proceeds[listing.seller];

        proceeds[listing.seller] += listing.price;
        _unlistNft(nftAddress, nftId);

        emit NftBought(nftAddress, nftId, listing.price, buyer);

        nft.safeTransferFrom(listing.seller, buyer, nftId);

        assert(nft.ownerOf(nftId) == buyer);
        assert(
            proceeds[listing.seller] == initialSellerProceeds + listing.price
        );
    }

    function withdrawProceeds() external hasProceeds(msg.sender) {
        uint initialContractBalance = address(this).balance;
        uint userProceeds = proceeds[msg.sender];
        proceeds[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: userProceeds}('');
        if (!success) {
            revert WithdrawProceedsFailed();
        }

        assert(address(this).balance == initialContractBalance - userProceeds);
        assert(proceeds[msg.sender] == 0);
    }
}
