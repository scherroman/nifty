import { Address, BigInt, Bytes, store } from '@graphprotocol/graph-ts'
import {
    ListingUpdated as ListingUpdatedEvent,
    NftBought as NftBoughtEvent,
    NftListed as NftListedEvent,
    NftUnlisted as NftUnlistedEvent
} from '../generated/Nifty/Nifty'
import {
    Listing,
    NftListedEvent as NftListedEventEntity,
    ListingUpdatedEvent as ListingUpdatedEventEntity,
    NftBoughtEvent as NftBoughtEventEntity,
    NftUnlistedEvent as NftUnlistedEventEntity
} from '../generated/schema'

function getListingId(nftAddress: Address, nftId: BigInt): Bytes {
    return Bytes.fromUTF8(`${nftAddress}-${nftId}`)
}

export function handleNftListed(event: NftListedEvent): void {
    let nftListedEvent = new NftListedEventEntity(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftId = params.nftId
    let price = params.price
    let seller = params.seller

    nftListedEvent.nftAddress = nftAddress
    nftListedEvent.nftId = nftId
    nftListedEvent.price = price
    nftListedEvent.seller = seller
    nftListedEvent.blockNumber = block.number
    nftListedEvent.blockTimestamp = block.timestamp
    nftListedEvent.transactionHash = transaction.hash

    let listing = new Listing(getListingId(nftAddress, nftId))
    listing.nftAddress = nftAddress
    listing.nftId = nftId
    listing.price = price
    listing.seller = seller
    listing.createdAt = block.timestamp
    listing.updatedAt = block.timestamp

    nftListedEvent.save()
    listing.save()
}

export function handleListingUpdated(event: ListingUpdatedEvent): void {
    let listingUpdatedEvent = new ListingUpdatedEventEntity(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftId = params.nftId
    let price = params.price
    let seller = params.seller

    listingUpdatedEvent.nftAddress = nftAddress
    listingUpdatedEvent.nftId = nftId
    listingUpdatedEvent.price = price
    listingUpdatedEvent.seller = seller
    listingUpdatedEvent.blockNumber = block.number
    listingUpdatedEvent.blockTimestamp = block.timestamp
    listingUpdatedEvent.transactionHash = transaction.hash

    let listing = Listing.load(getListingId(nftAddress, nftId))
    if (listing) {
        listing.price = price
        listing.seller = seller
        listing.updatedAt = block.timestamp
        listing.save()
    }

    listingUpdatedEvent.save()
}

export function handleNftBought(event: NftBoughtEvent): void {
    let nftBoughtEvent = new NftBoughtEventEntity(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    nftBoughtEvent.nftAddress = event.params.nftAddress
    nftBoughtEvent.nftId = event.params.nftId
    nftBoughtEvent.buyer = event.params.buyer
    nftBoughtEvent.price = event.params.price
    nftBoughtEvent.blockNumber = event.block.number
    nftBoughtEvent.blockTimestamp = event.block.timestamp
    nftBoughtEvent.transactionHash = event.transaction.hash

    nftBoughtEvent.save()
}

export function handleNftUnlisted(event: NftUnlistedEvent): void {
    let nftUnlistedEvent = new NftUnlistedEventEntity(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftId = params.nftId

    nftUnlistedEvent.nftAddress = params.nftAddress
    nftUnlistedEvent.nftId = params.nftId
    nftUnlistedEvent.blockNumber = block.number
    nftUnlistedEvent.blockTimestamp = block.timestamp
    nftUnlistedEvent.transactionHash = transaction.hash

    nftUnlistedEvent.save()
    store.remove('Listing', getListingId(nftAddress, nftId).toHexString())
}
