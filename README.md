# Nifty

A nifty marketplace for NFTs

## Overview

Nifty is an [Ethereum](https://ethereum.org) smart contract that allows users to list and buy NFTs. It also has an indexed subgraph deployed on [The Graph Network](https://thegraph.com) to enable rich GraphQL queries.

[View testnet contract](https://goerli.etherscan.io/address/0x3E5d4F330C059b2Df5B19d6F9E188c74E5aA165b)

[View testnet subgraph](https://thegraph.com/studio/subgraph/nifty-staging)

## Setup

**1. Install and start [Docker](https://www.docker.com/products/docker-desktop/)**

**2. Install dependencies**

```
npm install --force
```

**3. Create a `.env` file**

Add the following environment variables:

-   `GOERLI_RPC_URL` - Using [Alchemy](https://dashboard.alchemy.com) is recommended
-   `DEPLOYER_PRIVATE_KEY` - Creating a fresh Metamask wallet just for development, without any real funds is recommended
-   `ETHERSCAN_API_KEY` - See [Etherscan API](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics)
-   `COINMARKETCAP_API_KEY` - Optional, add to output gas report prices in USD. See [CoinMarketCap API](https://coinmarketcap.com/api)
-   `SHOULD_UPDATE_FRONT_END` - Optional, add and set to true to export contract addresses and ABIs to the frontend, false otherwise

## Building

**Build contracts**

```
npm run build:contracts
```

**Build testnet subgraph**

```
npm run build:subgraph:staging
```

**Build mainnet subgraph**

```
npm run build:subgraph:production
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

**Run contract unit tests**

```
npm run test:contracts:unit
```

**Run contract property tests**

```
npm run test:contracts:property
```

**Run contract assertion tests**

```
npm run test:contracts:assertion
```

**Run subgraph unit tests**

```
npm run test:subgraph:unit
```

**Run all unit tests**

```
npm run test:unit
```

**Run all tests**

```
npm run test
```

**Run all static checks and unit tests**

```
npm run check:unit
```

**Run all checks**

```
npm run check
```

## Security Analysis

**1. Install [Miniconda](http://conda.pydata.org/miniconda.html)**

Miniconda helps create an isolated virtual environment and install the tools we use for security analysis.

**Set up the nifty virtual environment**

```
npm run analyze:setup
```

**Run slither security analysis**

```
npm run analyze:slither
```

**Run mythril security analysis**

```
npm run analyze:mythril
```

**Run all security analysis tools**

```
npm run analyze
```

## Scripts

**Run a custom script**

```
npm run script:<environment> scripts/<script>.ts
```

**Estimate gas for a transaction**

1. Deploy contracts locally

```
npm run deploy:contracts:development
```

2. Run `estimateGas` script

```
npm run script:development scripts/estimateGas.ts
```

**Report gas usage for tests**

```
npm run report-gas-usage
```

## Deployment

**Deploy contracts locally**

```
npm run deploy:contracts:development
```

**Deploy contracts to testnet**

```
npm run deploy:contracts:staging
```

**Deploy subgraph to testnet**

1\) Update the subgraph's testnet Nifty contract address in [subgraph/networks.json](subgraph/networks.json)

2\) Deploy the subgraph

```

npm run deploy:subgraph:staging

```

3\) Increase the subgraph's version by checking it's current version on [Subgraph Studio](https://thegraph.com/studio)

```
Version Label (e.g. 0.0.1) › ...
```

**Deploy contracts to mainnet**

```

npm run deploy:contracts:production

```

**Deploy subgraph to mainnet**

```

npm run deploy:subgraph:production

```

## Notes

### Contract Addresses

Deployed contract addresses can be found under `deployments/<chain>/<ContractName>.json`

To enable or disable updating the frontend contract addresses and ABIs automatically, set the `UPDATE_FRONT_END` environment variable in `.env` to `true` or `false`.

### The Graph Initial Setup

```

graph init --studio nifty-staging

```

When setting up a new subgraph under the `subgraphs` directory, delete the `.git` submodule that is created there so that the subgraph is tracked directly rather than as a submodule.

## Run Echidna in interactive mode

To launch the echidna docker container in interactive mode, at `-it` to the `docker run` options:

```

docker run --rm -it -v `pwd`:/nifty ghcr.io/crytic/echidna/echidna:v2.0.4

```

This can let you inspect the internals of the docker container manually, and/or run `echidna-test` with more friendly visual feedback.

### Pre-commit Hooks

All checks are run locally automatically before a commit is made using `npm run check`.

**Modify the existing pre-commit hook**

Edit the [.husky/pre-commit](.husky/pre-commit) file

**Add a pre-commit hook**

`npx husky add .husky/pre-commit "npm run check"`

See the [Husky Documentation](https://typicode.github.io/husky/#/)to learn more on how to configure pre-commit hooks.

## Troubleshooting

### Errors when installing dependencies

There is currently [an issue](https://github.com/wighawag/hardhat-deploy-ethers/issues/27) with the `"@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers@0.3.0-beta.13",` package which causes errors when trying to update or install new packages. Use `--force` to override these errors.
