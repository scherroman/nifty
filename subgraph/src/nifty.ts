import {
    Address,
    BigInt,
    Bytes,
    store,
    ethereum
} from '@graphprotocol/graph-ts'
import {
    NftListed,
    ListingUpdated,
    NftBought,
    NftUnlisted
} from '../generated/Nifty/Nifty'
import {
    Nft,
    Listing,
    NftListedEvent,
    ListingUpdatedEvent,
    NftBoughtEvent,
    NftUnlistedEvent
} from '../generated/schema'

export function getEventId(event: ethereum.Event): Bytes {
    return event.transaction.hash.concatI32(event.logIndex.toI32())
}

export function getNftId(nftAddress: Address, nftTokenId: BigInt): Bytes {
    return Bytes.fromUTF8(`${nftAddress}-${nftTokenId}`)
}

export function getListingId(nftId: Bytes): Bytes {
    return nftId
}

export function handleNftListed(event: NftListed): void {
    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftTokenId = params.nftId
    let price = params.price
    let seller = params.seller

    let nft = new Nft(getNftId(nftAddress, nftTokenId))
    nft.address = nftAddress
    nft.tokenId = nftTokenId

    let listing = new Listing(getListingId(nft.id))
    listing.nft = nft.id
    listing.price = price
    listing.seller = seller
    listing.createdAt = block.timestamp
    listing.updatedAt = block.timestamp

    let nftListedEvent = new NftListedEvent(getEventId(event))
    nftListedEvent.nft = nft.id
    nftListedEvent.price = price
    nftListedEvent.seller = seller
    nftListedEvent.blockNumber = block.number
    nftListedEvent.blockTimestamp = block.timestamp
    nftListedEvent.transactionHash = transaction.hash

    nft.save()
    listing.save()
    nftListedEvent.save()
}

export function handleListingUpdated(event: ListingUpdated): void {
    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftTokenId = params.nftId
    let price = params.price
    let seller = params.seller

    let nftId = getNftId(nftAddress, nftTokenId)
    let listing = Listing.load(getListingId(nftId))

    if (listing == null) {
        throw new Error(`Listing not found for NFT ${nftId}`)
    }

    listing.price = price
    listing.seller = seller
    listing.updatedAt = block.timestamp

    let listingUpdatedEvent = new ListingUpdatedEvent(getEventId(event))
    listingUpdatedEvent.nft = nftId
    listingUpdatedEvent.price = price
    listingUpdatedEvent.seller = seller
    listingUpdatedEvent.blockNumber = block.number
    listingUpdatedEvent.blockTimestamp = block.timestamp
    listingUpdatedEvent.transactionHash = transaction.hash

    listing.save()
    listingUpdatedEvent.save()
}

export function handleNftBought(event: NftBought): void {
    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftTokenId = params.nftId
    let price = params.price
    let buyer = params.buyer

    let nftBoughtEvent = new NftBoughtEvent(getEventId(event))
    nftBoughtEvent.nft = getNftId(nftAddress, nftTokenId)
    nftBoughtEvent.buyer = buyer
    nftBoughtEvent.price = price
    nftBoughtEvent.blockNumber = block.number
    nftBoughtEvent.blockTimestamp = block.timestamp
    nftBoughtEvent.transactionHash = transaction.hash

    nftBoughtEvent.save()
}

export function handleNftUnlisted(event: NftUnlisted): void {
    let params = event.params
    let block = event.block
    let transaction = event.transaction

    let nftAddress = params.nftAddress
    let nftTokenId = params.nftId

    let nftId = getNftId(nftAddress, nftTokenId)
    let listingId = getListingId(nftId)

    let nftUnlistedEvent = new NftUnlistedEvent(getEventId(event))
    nftUnlistedEvent.nft = nftId
    nftUnlistedEvent.blockNumber = block.number
    nftUnlistedEvent.blockTimestamp = block.timestamp
    nftUnlistedEvent.transactionHash = transaction.hash

    nftUnlistedEvent.save()
    store.remove('Listing', listingId.toHexString())
}
