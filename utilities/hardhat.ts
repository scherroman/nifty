import { Network } from 'hardhat/types'
import {
    CHAIN_CONFIGURATION,
    ChainConfigurationItem
} from '../configuration/chainConfiguration'

export function getChainConfiguration(
    network: Network
): ChainConfigurationItem {
    let { chainId } = network.config

    if (chainId === undefined) {
        throw new Error('Missing chain id')
    }

    return CHAIN_CONFIGURATION[chainId]
}
