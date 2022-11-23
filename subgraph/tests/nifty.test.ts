import { describe, test, assert, afterAll, clearStore } from 'matchstick-as'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
    handleNftListed,
    handleListingUpdated,
    handleNftBought,
    handleNftUnlisted,
    getEventId,
    getListingId
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
    id: BigInt

    constructor(address: Address, id: BigInt) {
        this.address = address
        this.id = id
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

// let nftAddress = Address.fromString(
//     '0x0000000000000000000000000000000000000001'
// )
// let nftId = BigInt.fromI32(0)
// let price = BigInt.fromI32(100)
// let seller = Address.fromString('0x0000000000000000000000000000000000000002')

describe('Events', () => {
    afterAll(() => {
        clearStore()
    })

    describe('NftListed', () => {
        test('stores a Listing and NftListedEvent', () => {
            let event = createNftListedEvent(
                listing.nft.address,
                listing.nft.id,
                listing.price,
                listing.seller
            )
            handleNftListed(event)

            let nftlistedEventId = getEventId(event).toHexString()
            let listingId = getListingId(
                listing.nft.address,
                listing.nft.id
            ).toHexString()

            assert.entityCount('NftListedEvent', 1)
            assert.fieldEquals(
                'NftListedEvent',
                nftlistedEventId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'NftListedEvent',
                nftlistedEventId,
                'nftId',
                listing.nft.id.toString()
            )
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

            assert.entityCount('Listing', 1)
            assert.fieldEquals(
                'Listing',
                listingId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'Listing',
                listingId,
                'nftId',
                listing.nft.id.toString()
            )
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
        })
    })

    describe('ListingUpdated', () => {
        test('updates the Listing and stores a ListingUpdatedEvent', () => {
            let event = createListingUpdatedEvent(
                listing.nft.address,
                listing.nft.id,
                BigInt.fromI32(200),
                listing.seller
            )
            handleListingUpdated(event)

            let listingUpdatedEventId = getEventId(event).toHexString()
            let listingId = getListingId(
                listing.nft.address,
                listing.nft.id
            ).toHexString()

            assert.entityCount('ListingUpdatedEvent', 1)
            assert.entityCount('Listing', 1)
            assert.fieldEquals(
                'ListingUpdatedEvent',
                listingUpdatedEventId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'ListingUpdatedEvent',
                listingUpdatedEventId,
                'nftId',
                listing.nft.id.toString()
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

            assert.fieldEquals(
                'Listing',
                listingId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'Listing',
                listingId,
                'nftId',
                listing.nft.id.toString()
            )
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
        })
    })

    describe('NftBought', () => {
        test('stores an NftBoughtEvent', () => {
            let event = createNftBoughtEvent(
                listing.nft.address,
                listing.nft.id,
                Address.fromString(
                    '0x0000000000000000000000000000000000000003'
                ),
                BigInt.fromI32(200)
            )
            handleNftBought(event)

            let nftBoughtEventId = getEventId(event).toHexString()

            assert.entityCount('NftBoughtEvent', 1)
            assert.entityCount('Listing', 1)
            assert.fieldEquals(
                'NftBoughtEvent',
                nftBoughtEventId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'NftBoughtEvent',
                nftBoughtEventId,
                'nftId',
                listing.nft.id.toString()
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
                listing.nft.id
            )
            handleNftUnlisted(event)

            let nftUnlistedEventId = getEventId(event).toHexString()

            assert.entityCount('NftUnlistedEvent', 1)
            assert.entityCount('Listing', 0)
            assert.fieldEquals(
                'NftUnlistedEvent',
                nftUnlistedEventId,
                'nftAddress',
                listing.nft.address.toHexString()
            )
            assert.fieldEquals(
                'NftUnlistedEvent',
                nftUnlistedEventId,
                'nftId',
                listing.nft.id.toString()
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
