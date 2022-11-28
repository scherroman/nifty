import { describe, test, assert, afterAll, clearStore } from 'matchstick-as'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
    handleNftListed,
    handleListingUpdated,
    handleNftBought,
    handleNftUnlisted,
    getNftId,
    getListingId,
    getEventId
} from '../src/nifty'
import {
    createNftListedEvent,
    createListingUpdatedEvent,
    createNftBoughtEvent,
    createNftUnlistedEvent
} from './nifty-utils'

// https://thegraph.com/docs/en/developing/unit-testing-framework

// No object literals or destructuring in AssemblyScript is rough >.<

class Nft {
    address: Address
    tokenId: BigInt

    constructor(address: Address, tokenId: BigInt) {
        this.address = address
        this.tokenId = tokenId
    }
}

class Listing {
    nft: Nft
    price: BigInt
    seller: Address

    constructor(nft: Nft, price: BigInt, seller: Address) {
        this.nft = nft
        this.price = price
        this.seller = seller
    }
}

let listing = new Listing(
    new Nft(
        Address.fromString('0x0000000000000000000000000000000000000001'),
        BigInt.fromI32(0)
    ),
    BigInt.fromI32(100),
    Address.fromString('0x0000000000000000000000000000000000000002')
)

describe('Events', () => {
    afterAll(() => {
        clearStore()
    })

    describe('NftListed', () => {
        test('stores an Nft, Listing and NftListedEvent', () => {
            let event = createNftListedEvent(
                listing.nft.address,
                listing.nft.tokenId,
                listing.price,
                listing.seller
            )
            handleNftListed(event)

            let nftlistedEventId = getEventId(event).toHexString()
            let nftId = getNftId(
                listing.nft.address,
                listing.nft.tokenId
            ).toHexString()
            let listingId = getListingId(
                Bytes.fromHexString(nftId)
            ).toHexString()

            assert.entityCount('Nft', 1)
            assert.entityCount('Listing', 1)
            assert.entityCount('NftListedEvent', 1)

            assert.fieldEquals(
                'Nft',
                nftId,
                'address',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'Nft',
                nftId,
                'tokenId',
                listing.nft.tokenId.toString()
            )

            assert.fieldEquals('Listing', listingId, 'nft', nftId)
            assert.fieldEquals(
                'Listing',
                listingId,
                'price',
                listing.price.toString()
            )
            assert.fieldEquals(
                'Listing',
                listingId,
                'seller',
                listing.seller.toHexString()
            )

            assert.fieldEquals('NftListedEvent', nftlistedEventId, 'nft', nftId)
            assert.fieldEquals(
                'NftListedEvent',
                nftlistedEventId,
                'price',
                listing.price.toString()
            )
            assert.fieldEquals(
                'NftListedEvent',
                nftlistedEventId,
                'seller',
                listing.seller.toHexString()
            )
        })
    })

    describe('ListingUpdated', () => {
        test('updates the Listing and stores a ListingUpdatedEvent', () => {
            let event = createListingUpdatedEvent(
                listing.nft.address,
                listing.nft.tokenId,
                BigInt.fromI32(200),
                listing.seller
            )
            handleListingUpdated(event)

            let listingUpdatedEventId = getEventId(event).toHexString()
            let nftId = getNftId(listing.nft.address, listing.nft.tokenId)
            let listingId = getListingId(nftId).toHexString()

            assert.entityCount('Nft', 1)
            assert.entityCount('Listing', 1)
            assert.entityCount('ListingUpdatedEvent', 1)

            assert.fieldEquals('Listing', listingId, 'nft', nftId.toHexString())
            assert.fieldEquals(
                'Listing',
                listingId,
                'price',
                BigInt.fromI32(200).toString()
            )
            assert.fieldEquals(
                'Listing',
                listingId,
                'seller',
                listing.seller.toHexString()
            )

            assert.fieldEquals(
                'ListingUpdatedEvent',
                listingUpdatedEventId,
                'nft',
                nftId.toHexString()
            )
            assert.fieldEquals(
                'ListingUpdatedEvent',
                listingUpdatedEventId,
                'price',
                BigInt.fromI32(200).toString()
            )
            assert.fieldEquals(
                'ListingUpdatedEvent',
                listingUpdatedEventId,
                'seller',
                listing.seller.toHexString()
            )
        })
    })

    describe('NftBought', () => {
        test('stores an NftBoughtEvent', () => {
            let event = createNftBoughtEvent(
                listing.nft.address,
                listing.nft.tokenId,
                Address.fromString(
                    '0x0000000000000000000000000000000000000003'
                ),
                BigInt.fromI32(200)
            )
            handleNftBought(event)

            let nftId = getNftId(listing.nft.address, listing.nft.tokenId)
            let nftBoughtEventId = getEventId(event).toHexString()

            assert.entityCount('Nft', 1)
            assert.entityCount('Listing', 1)
            assert.entityCount('NftBoughtEvent', 1)

            assert.fieldEquals(
                'NftBoughtEvent',
                nftBoughtEventId,
                'nft',
                nftId.toHexString()
            )
            assert.fieldEquals(
                'NftBoughtEvent',
                nftBoughtEventId,
                'price',
                BigInt.fromI32(200).toString()
            )
            assert.fieldEquals(
                'NftBoughtEvent',
                nftBoughtEventId,
                'buyer',
                Address.fromString(
                    '0x0000000000000000000000000000000000000003'
                ).toHexString()
            )
        })
    })

    describe('NftUnlisted', () => {
        test('removes the Listing and stores an NftUnlistedEvent', () => {
            let event = createNftUnlistedEvent(
                listing.nft.address,
                listing.nft.tokenId
            )
            handleNftUnlisted(event)

            let nftId = getNftId(listing.nft.address, listing.nft.tokenId)
            let nftUnlistedEventId = getEventId(event).toHexString()

            assert.entityCount('Nft', 1)
            assert.entityCount('Listing', 0)
            assert.entityCount('NftUnlistedEvent', 1)

            assert.fieldEquals(
                'NftUnlistedEvent',
                nftUnlistedEventId,
                'nft',
                nftId.toHexString()
            )
        })
    })
})

export {
    handleNftListed,
    handleListingUpdated,
    handleNftBought,
    handleNftUnlisted
}
