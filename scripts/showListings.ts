import { ethers } from 'hardhat'

import { BasicNft, Nifty } from '../typechain-types'

async function main(): Promise<void> {
    let nifty = await ethers.getContract<Nifty>('Nifty')
    let basicNft = await ethers.getContract<BasicNft>('BasicNft')

    for (let index = 0; index < 10; index++) {
        let listing = await nifty.listingByNftIdByNftAddress(
            basicNft.address,
            index
        )
        console.log(`listing ${index}: `)
        console.log(`price: ${listing.price}`)
        console.log(`seller: ${listing.seller}`)
    }
}

main().catch((error) => {
    console.error(error)
    throw error
})
