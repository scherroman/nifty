import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { BasicNft, NftMarketplace } from '../typechain-types'

const NFT_LISTING_PRICE = ethers.utils.parseEther('0.1')

async function main(): Promise<void> {
    let nftMarketplace = await ethers.getContract<NftMarketplace>(
        'NftMarketplace'
    )
    let basicNft = await ethers.getContract<BasicNft>('BasicNft')

    console.log('Minting NFT...')

    let transaction = await basicNft.mintNft()
    let receipt = await transaction.wait(1)
    let nftMintedEvent = receipt.events?.find(
        (event) => event.event === 'NftMinted'
    )

    let nftId
    let _nftId: unknown = nftMintedEvent?.args?.id
    if (_nftId instanceof BigNumber) {
        nftId = _nftId
    } else {
        throw new Error(`Invalid NFT id ${_nftId}`)
    }

    console.log('Listing NFT...')

    await (await basicNft.approve(nftMarketplace.address, nftId)).wait(1)
    await (
        await nftMarketplace.listNft(basicNft.address, nftId, NFT_LISTING_PRICE)
    ).wait(1)

    console.log('NFT listed!')
}

main().catch((error) => {
    console.error(error)
    throw error
})
