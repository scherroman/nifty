/* eslint-disable @typescript-eslint/naming-convention */
export const CHAIN_CONFIGURATION: Record<number, ChainConfigurationItem> = {
    1: {
        name: 'mainnet',
        numberOfConfirmationsToWaitForDeploy: 3,
        randomnessCoordinatorAddress:
            '0x271682DEB8C4E0901D1a1550aD2e64D568E69909',
        randomnessGasLane:
            '0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef',
        linkTokenAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA'
    },
    5: {
        name: 'goerli',
        numberOfConfirmationsToWaitForDeploy: 3,
        randomnessCoordinatorAddress:
            '0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D',
        randomnessGasLane:
            '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15',
        linkTokenAddress: '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'
    },
    31337: {
        name: 'localhost',
        numberOfConfirmationsToWaitForDeploy: 1,
        randomnessCoordinatorAddress:
            '0x0000000000000000000000000000000000000000',
        randomnessGasLane:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
        linkTokenAddress: '0x0000000000000000000000000000000000000000'
    }
}
/* eslint-enable @typescript-eslint/naming-convention */

export interface ChainConfigurationItem {
    name: string
    numberOfConfirmationsToWaitForDeploy: number
    randomnessCoordinatorAddress: string
    randomnessGasLane: string
    linkTokenAddress: string
}

export const DEVELOPMENT_CHAINS = ['hardhat', 'localhost']
