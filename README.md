# Nifty

## Overview

Nifty allows users to list nfts, buy nfts, cancel listings, update listings, and withdraw proceeds.

## Setup

**1. Install dependencies**

```
npm install --force
```

**2. Create a `.env` file**

Add the following environment variables:

-   GOERLI_RPC_URL - Using [Alchemy](https://dashboard.alchemy.com) is recommended
-   DEPLOYER_PRIVATE_KEY - Creating a fresh Metamask wallet just for development, without any real funds is recommended
-   ETHERSCAN_API_KEY - See [Etherscan API](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics)
-   COINMARKETCAP_API_KEY - Optional, add to output gas report prices in USD. See [CoinMarketCap API](https://coinmarketcap.com/api)
-   SHOULD_UPDATE_FRONT_END - Optional, add and set to true to export contract addresses and ABIs to the frontend, false otherwise

## Usage

**Estimate gas for a transaction**

1. Deploy contracts locally

```
npm run deploy:development
```

2. Run `estimateGas` script

```
npm run run-script:development scripts/estimateGas.ts
```

**Report gas usage for tests**

```
npm run report-gas-usage
```

## Building

**Build The Graph subgraph**

```
cd subgraph/staging`
npx graph codegen
```

## Testing

**Run linter**

```
npm run lint
```

**Run typechecker**

```
npm run typecheck
```

**Run all static checks**

```
npm run staticcheck
```

**Run tests**

```
npm run test
```

**Run unit tests**

```
npm run test:unit
```

**Run contract unit tests**

```
npm run test:contract:unit
```

**Run subgraph tests**

```
npm run test:subgraph
```

**Run integration tests**

```
npm run test:integration
```

**Run all checks**

```
npm run check
```

## Deployment

**Deploy locally**

```
npm run deploy:development
```

**Deploy to testnet**

```
npm run deploy:staging
```

**Deploy subgraph to testnet**

```
npm run deploy-subgraph:staging
```

**Deploy to mainnet**

```
npm run deploy:production
```

## Notes

### Contract Addresses

Deployed contract addresses can be found under `deployments/<chain>/<ContractName>.json`

To enable or disable updating the frontend contract addresses and ABIs automatically, set the `UPDATE_FRONT_END` environment variable in `.env` to `true` or `false`.

### The Graph Initial Setup

```
graph init --studio nifty-staging
```

When setting up a new subgraph under the `subgraphs` directory, delete the `.git` submodule that is created there so that the subgraph is tracked within this repository.

## Troubleshooting

### Errors when installing dependencies

There is currently [an issue](https://github.com/wighawag/hardhat-deploy-ethers/issues/27) with the `"@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers@0.3.0-beta.13",` package which causes errors when trying to update or install new packages. Use `--force` to override these errors.
