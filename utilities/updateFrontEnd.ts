import zod from 'zod'
import fs from 'fs-extra'
import { ethers, network } from 'hardhat'

import { Nifty } from '../typechain-types'

// const TYPES_FOLDER = `typechain-types`
const FRONT_END_CONTRACTS_FOLDER = '../nifty-web/source/contracts'
const FRONT_END_NIFTY_CONTRACT_FOLDER = `${FRONT_END_CONTRACTS_FOLDER}/nifty`
const FRONT_END_NIFTY_ADDRESSES_FILE = `${FRONT_END_NIFTY_CONTRACT_FOLDER}/addresses.json`
const FRONT_END_NIFTY_ABI_FILE = `${FRONT_END_NIFTY_CONTRACT_FOLDER}/abi.ts`
// const FRONT_END_TYPES_FOLDER = `${FRONT_END_NIFTY_CONTRACT_FOLDER}/types`

const FRONT_END_ERC721_INTERFACE_FOLDER = `${FRONT_END_CONTRACTS_FOLDER}/ierc721`
const FRONT_END_ERC721_ABI_FILE = `${FRONT_END_ERC721_INTERFACE_FOLDER}/abi.ts`

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

    let nifty = await ethers.getContract<Nifty>('Nifty')
    let contractAddressesByChainId: ContractAddressesByChainId
    try {
        contractAddressesByChainId = ContractAddressesByChainId.parse(
            JSON.parse(
                await fs.readFile(FRONT_END_NIFTY_ADDRESSES_FILE, 'utf8')
            )
        )
    } catch (error) {
        contractAddressesByChainId = {}
    }

    if (chainId in contractAddressesByChainId) {
        if (!(contractAddressesByChainId[chainId] === nifty.address)) {
            contractAddressesByChainId[chainId] = nifty.address
        }
    } else {
        contractAddressesByChainId[chainId] = nifty.address
    }

    await fs.outputFile(
        FRONT_END_NIFTY_ADDRESSES_FILE,
        JSON.stringify(contractAddressesByChainId)
    )
}

async function updateAbi(): Promise<void> {
    let nifty = await ethers.getContract('Nifty')
    let abi = AbiString.parse(
        nifty.interface.format(ethers.utils.FormatTypes.json)
    )
    let abiModuleString = `export default ${abi} as const`
    await fs.outputFile(FRONT_END_NIFTY_ABI_FILE, abiModuleString)

    let iErc721 = await ethers.getContract('BasicNft')
    abi = AbiString.parse(
        iErc721.interface.format(ethers.utils.FormatTypes.json)
    )
    abiModuleString = `export default ${abi} as const`
    await fs.outputFile(FRONT_END_ERC721_ABI_FILE, abiModuleString)
}

// async function updateTypes(): Promise<void> {
//     await fs.copy(TYPES_FOLDER, FRONT_END_TYPES_FOLDER)
// }
