import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

import { BasicNft } from '../typechain-types'

export async function mint(): Promise<BigNumber> {
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

    console.log('NFT minted!')

    return nftId
}
