import zod from 'zod'
import fs from 'fs-extra'
import { ethers, network } from 'hardhat'

import { NftMarketplace } from '../typechain-types'

// const TYPES_FOLDER = `typechain-types`
const FRONT_END_NFT_MARKETPLACE_CONTRACT_FOLDER =
    '../nft-marketplace-web/contracts/nftMarketplace'
const FRONT_END_ADDRESSES_FILE = `${FRONT_END_NFT_MARKETPLACE_CONTRACT_FOLDER}/addresses.json`
const FRONT_END_ABI_FILE = `${FRONT_END_NFT_MARKETPLACE_CONTRACT_FOLDER}/abi.ts`
// const FRONT_END_TYPES_FOLDER = `${FRONT_END_NFT_MARKETPLACE_CONTRACT_FOLDER}/types`

const ContractAddressesByChainId = zod.record(zod.string(), zod.string())
const AbiString = zod.string()

type ContractAddressesByChainId = zod.infer<typeof ContractAddressesByChainId>

export async function updateFrontEnd(): Promise<void> {
    let updatingContractAddresses = updateContractAddresses()
    let updatingAbi = updateAbi()
    // let updatingTypes = updateTypes()
    await Promise.all([updatingContractAddresses, updatingAbi])
}

async function updateContractAddresses(): Promise<void> {
    let chainId = network.config.chainId?.toString()

    if (chainId === undefined) {
        throw new Error('Missing chain id')
    }

    let nftMarketplace = await ethers.getContract<NftMarketplace>(
        'NftMarketplace'
    )
    let contractAddressesByChainId: ContractAddressesByChainId
    try {
        contractAddressesByChainId = ContractAddressesByChainId.parse(
            JSON.parse(await fs.readFile(FRONT_END_ADDRESSES_FILE, 'utf8'))
        )
    } catch (error) {
        contractAddressesByChainId = {}
    }

    if (chainId in contractAddressesByChainId) {
        if (!(contractAddressesByChainId[chainId] === nftMarketplace.address)) {
            contractAddressesByChainId[chainId] = nftMarketplace.address
        }
    } else {
        contractAddressesByChainId[chainId] = nftMarketplace.address
    }

    await fs.outputFile(
        FRONT_END_ADDRESSES_FILE,
        JSON.stringify(contractAddressesByChainId)
    )
}

async function updateAbi(): Promise<void> {
    let nftMarketplace = await ethers.getContract('NftMarketplace')
    let abi = AbiString.parse(
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )
    let abiModuleString = `export default ${abi} as const`
    await fs.outputFile(FRONT_END_ABI_FILE, abiModuleString)
}

// async function updateTypes(): Promise<void> {
//     await fs.copy(TYPES_FOLDER, FRONT_END_TYPES_FOLDER)
// }
