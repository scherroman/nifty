import { ethers } from 'hardhat'

import { BasicNft } from '../typechain-types'

async function main(): Promise<void> {
    let basicNft = await ethers.getContract<BasicNft>('BasicNft')

    console.log('Minting NFT...')

    await (await basicNft.mintNft()).wait(1)

    console.log('NFT minted!')
}

main().catch((error) => {
    console.error(error)
    throw error
})
