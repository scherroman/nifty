import { ethers, getNamedAccounts } from 'hardhat'
import { verify } from '../utilities/etherscan'

import { getConstructorArguments } from '../deployment/1_deployNifty'

async function main(): Promise<void> {
    let { deployer } = await getNamedAccounts()
    let constructorArguments = getConstructorArguments()
    let nifty = await ethers.getContract('Nifty', deployer)

    await verify(nifty.address, constructorArguments)
}

main().catch((error) => {
    console.error(error)
    throw error
})
