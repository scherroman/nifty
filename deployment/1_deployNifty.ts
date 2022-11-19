import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { verify } from '../utilities/etherscan'
import { getChainConfiguration } from '../utilities/hardhat'
import { DEVELOPMENT_CHAINS } from '../configuration/chainConfiguration'

let deploy: DeployFunction = async ({
    network,
    deployments,
    getNamedAccounts
}: HardhatRuntimeEnvironment): Promise<void> => {
    let { deployer } = await getNamedAccounts()
    let { numberOfConfirmationsToWaitForDeploy } =
        getChainConfiguration(network)

    deployments.log('-------------------------')

    let _arguments: string[] = getConstructorArguments()
    let nifty = await deployments.deploy('Nifty', {
        from: deployer,
        args: _arguments,
        log: true,
        waitConfirmations: numberOfConfirmationsToWaitForDeploy
    })

    if (!DEVELOPMENT_CHAINS.includes(network.name)) {
        await verify(nifty.address, _arguments)
    }
}

export function getConstructorArguments(): string[] {
    return []
}

deploy.tags = ['all', 'nifty']

export default deploy
