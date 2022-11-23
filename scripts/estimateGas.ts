import { ethers } from 'hardhat'

import { Nifty, BasicNft } from '../typechain-types'
import { mint } from '../utilities/contract'

async function main(): Promise<void> {
    let basicNft = await ethers.getContract<BasicNft>('BasicNft')
    let nifty = await ethers.getContract<Nifty>('Nifty')

    let nftId = await mint()
    await (await basicNft.approve(nifty.address, nftId)).wait(1)
    let gasEstimate = await nifty.estimateGas.listNft(
        basicNft.address,
        nftId,
        ethers.utils.parseEther('0.01')
    )

    console.log(`Estimated gas: ${gasEstimate.toString()}`)
}

main().catch((error) => {
    console.error(error)
    throw error
})
