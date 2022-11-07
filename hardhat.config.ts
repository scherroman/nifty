import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'hardhat-deploy'
import 'dotenv/config'

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

if (GOERLI_RPC_URL === undefined) {
    throw new Error('Missing GOERLI_RPC_URL environment variable')
}

if (MAINNET_RPC_URL === undefined) {
    throw new Error('Missing MAINNET_RPC_URL environment variable')
}

if (DEPLOYER_PRIVATE_KEY === undefined) {
    throw new Error('Missing DEPLOYER_PRIVATE_KEY environment variable')
}

if (ETHERSCAN_API_KEY === undefined) {
    throw new Error('Missing ETHERSCAN_API_KEY environment variable')
}

const CONFIG: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: '0.8.17' }, { version: '0.7.6' }]
    },
    networks: {
        localhost: {
            chainId: 31337,
            url: 'http://127.0.0.1:8545/'
        },
        goerli: {
            chainId: 5,
            url: GOERLI_RPC_URL,
            accounts: [DEPLOYER_PRIVATE_KEY]
        },
        mainnet: {
            chainId: 1,
            url: MAINNET_RPC_URL,
            accounts: [DEPLOYER_PRIVATE_KEY]
        }
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        user: {
            default: 1
        }
    },
    mocha: {
        timeout: 360000
    },
    paths: {
        tests: './tests',
        deploy: './deployment'
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        outputFile: 'gasReport.txt',
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY
    }
}

export default CONFIG
