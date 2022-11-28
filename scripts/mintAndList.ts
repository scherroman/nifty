import { ethers } from 'hardhat'

import { BasicNft, Nifty } from '../typechain-types'
import { mint } from '../utilities/contract'

const NFT_LISTING_PRICE = ethers.utils.parseEther('0.01')

async function main(): Promise<void> {
    let nifty = await ethers.getContract<Nifty>('Nifty')
    let basicNft = await ethers.getContract<BasicNft>('BasicNft')

    let nftId = await mint()

    console.log('Listing NFT...')

    await (await basicNft.approve(nifty.address, nftId)).wait(1)
    await (
        await nifty.listNft(basicNft.address, nftId, NFT_LISTING_PRICE)
    ).wait(1)

    console.log('NFT listed!')
}

main().catch((error) => {
    console.error(error)
    throw error
})
