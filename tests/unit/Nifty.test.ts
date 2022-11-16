import { expect } from 'chai'
import { BigNumber, ContractTransaction, ContractReceipt } from 'ethers'
import { ethers, network, deployments, getNamedAccounts } from 'hardhat'

import { Nifty, BasicNft } from '../../typechain-types'
import { DEVELOPMENT_CHAINS } from '../../configuration/chainConfiguration'

const NFT_LISTING_PRICE = ethers.utils.parseEther('0.1')

if (DEVELOPMENT_CHAINS.includes(network.name)) {
    describe('Nifty', () => {
        let nifty: Nifty
        let userNifty: Nifty
        let basicNft: BasicNft
        let deployer: string
        let user: string
        let nftAddress: string
        let nftId: BigNumber
        beforeEach(async () => {
            await deployments.fixture(['tests', 'nifty'])
            nifty = await ethers.getContract('Nifty', deployer)
            userNifty = await ethers.getContract<Nifty>('Nifty', user)
            ;({ deployer, user } = await getNamedAccounts())

            basicNft = await ethers.getContract<BasicNft>('BasicNft', deployer)
            nftAddress = basicNft.address

            let receipt = await (await basicNft.mintNft()).wait(1)
            let nftMintedEvent = receipt.events?.find(
                (event) => event.event === 'NftMinted'
            )

            let _nftId: unknown = nftMintedEvent?.args?.id
            if (_nftId instanceof BigNumber) {
                nftId = _nftId
            } else {
                throw new Error('Invalid NFT id')
            }
        })

        async function listBasicNft(): Promise<{
            transaction: ContractTransaction
            receipt: ContractReceipt
        }> {
            await (await basicNft.approve(nifty.address, nftId)).wait(1)
            let transaction = await nifty.listNft(
                nftAddress,
                nftId,
                NFT_LISTING_PRICE
            )
            let receipt = await transaction.wait(1)

            return { transaction, receipt }
        }

        describe('listNft', () => {
            it('reverts if a listing price is not provided', async () => {
                await expect(
                    nifty.listNft(nftAddress, nftId, 0)
                ).to.be.revertedWithCustomError(
                    nifty,
                    'ListingPriceNotProvided'
                )
            })

            it('reverts if the lister is not the owner of the nft', async () => {
                let userNifty = await ethers.getContract<Nifty>('Nifty', user)
                await expect(
                    userNifty.listNft(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(nifty, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not approved for the marketplace', async () => {
                await expect(
                    nifty.listNft(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(
                    nifty,
                    'NftNotApprovedForMarketplace'
                )
            })

            it('reverts if the nft is already listed', async () => {
                await listBasicNft()
                await expect(
                    nifty.listNft(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(nifty, 'NftAlreadyListed')
            })

            it('lists the nft', async () => {
                let { transaction, receipt } = await listBasicNft()
                let listing = await nifty.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nifty.numberOfListings()

                let nftListedEvent = receipt.events?.find(
                    (event) => event.event === 'NftListed'
                )

                expect(listing.price).to.equal(NFT_LISTING_PRICE)
                expect(listing.seller).to.equal(deployer)
                expect(numberOfListings).to.equal(1)
                await expect(transaction).to.emit(nifty, 'NftListed')
                expect(nftListedEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftListedEvent?.args?.nftId).to.equal(nftId)
                expect(nftListedEvent?.args?.price).to.equal(NFT_LISTING_PRICE)
                expect(nftListedEvent?.args?.seller).to.equal(deployer)
            })
        })

        describe('updateListing', () => {
            it('reverts if a listing price is not provided', async () => {
                await expect(
                    nifty.updateListing(nftAddress, nftId, 0)
                ).to.be.revertedWithCustomError(
                    nifty,
                    'ListingPriceNotProvided'
                )
            })

            it('reverts if the updater is not the owner of the nft', async () => {
                await expect(
                    userNifty.updateListing(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE.add(1)
                    )
                ).to.be.revertedWithCustomError(nifty, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not listed', async () => {
                await expect(
                    nifty.updateListing(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(nifty, 'NftNotListed')
            })

            it('updates the listing', async () => {
                await listBasicNft()
                let newPrice = NFT_LISTING_PRICE.add(NFT_LISTING_PRICE)

                let transaction = await nifty.updateListing(
                    nftAddress,
                    nftId,
                    newPrice
                )
                let receipt = await transaction.wait(1)
                let listingUpdatedEvent = receipt.events?.find(
                    (event) => event.event === 'ListingUpdated'
                )

                let listing = await nifty.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                expect(listing.price).to.equal(newPrice)
                await expect(transaction).to.emit(nifty, 'ListingUpdated')
                expect(listingUpdatedEvent?.args?.nftAddress).to.equal(
                    nftAddress
                )
                expect(listingUpdatedEvent?.args?.nftId).to.equal(nftId)
                expect(listingUpdatedEvent?.args?.price).to.equal(newPrice)
                expect(listingUpdatedEvent?.args?.seller).to.equal(deployer)
            })

            it("updates the listing's seller if the owner has changed", async () => {
                await listBasicNft()
                await (
                    await basicNft['safeTransferFrom(address,address,uint256)'](
                        deployer,
                        user,
                        nftId
                    )
                ).wait(1)
                await (
                    await userNifty.updateListing(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE
                    )
                ).wait(1)
                let listing = await nifty.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                expect(listing.price).to.equal(NFT_LISTING_PRICE)
                expect(listing.seller).to.equal(user)
            })
        })

        describe('unlistNft', () => {
            it('reverts if the unlister is not the owner of the nft', async () => {
                await expect(
                    userNifty.unlistNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(nifty, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not listed', async () => {
                await expect(
                    nifty.unlistNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(nifty, 'NftNotListed')
            })

            it('unlists the nft', async () => {
                await listBasicNft()
                let transaction = await nifty.unlistNft(nftAddress, nftId)
                let receipt = await transaction.wait(1)
                let nftUnlistedEvent = receipt.events?.find(
                    (event) => event.event === 'NftUnlisted'
                )

                let listing = await nifty.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nifty.numberOfListings()

                expect(listing.price).to.equal(0)
                expect(listing.seller).to.equal(
                    '0x0000000000000000000000000000000000000000'
                )
                expect(numberOfListings).to.equal(0)
                await expect(transaction).to.emit(nifty, 'NftUnlisted')
                expect(nftUnlistedEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftUnlistedEvent?.args?.nftId).to.equal(nftId)
            })
        })

        describe('buyNft', () => {
            it('reverts if the nft is not listed', async () => {
                await expect(
                    nifty.buyNft(
                        '0x0000000000000000000000000000000000000000',
                        nftId
                    )
                ).to.be.revertedWithCustomError(nifty, 'NftNotListed')
                await expect(
                    nifty.buyNft(nftAddress, '1337')
                ).to.be.revertedWithCustomError(nifty, 'NftNotListed')
            })

            it('reverts if the nft price is not paid', async () => {
                await listBasicNft()
                await expect(
                    nifty.buyNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(nifty, 'ListingPriceNotPaid')
            })

            it("updates the seller's proceeds, unlists the nft, and transfers the nft to the buyer", async () => {
                await listBasicNft()
                let transaction = await userNifty.buyNft(nftAddress, nftId, {
                    value: NFT_LISTING_PRICE
                })
                let receipt = await transaction.wait(1)
                let nftBoughtEvent = receipt.events?.find(
                    (event) => event.event === 'NftBought'
                )

                let sellerProceeds = await nifty.proceeds(deployer)
                let listing = await nifty.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nifty.numberOfListings()
                let newOwner = await basicNft.ownerOf(nftId)

                expect(sellerProceeds).to.equal(NFT_LISTING_PRICE)
                expect(listing.price).to.equal(0)
                expect(listing.seller).to.equal(
                    '0x0000000000000000000000000000000000000000'
                )
                expect(numberOfListings).to.equal(0)
                expect(newOwner).to.equal(user)
                await expect(transaction).to.emit(nifty, 'NftBought')
                expect(nftBoughtEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftBoughtEvent?.args?.nftId).to.equal(nftId)
                expect(nftBoughtEvent?.args?.buyer).to.equal(user)
                expect(nftBoughtEvent?.args?.price).to.equal(NFT_LISTING_PRICE)
            })
        })

        describe('withdrawProceeds', () => {
            it('reverts if the withdrawer has no proceeds', async () => {
                await expect(
                    nifty.withdrawProceeds()
                ).to.be.revertedWithCustomError(nifty, 'NoProceedsToWithdraw')
            })

            it("withdraws proceeds to the withdrawer's account", async () => {
                await listBasicNft()

                let withdrawerStartingBalance = await nifty.provider.getBalance(
                    deployer
                )

                await (
                    await userNifty.buyNft(nftAddress, nftId, {
                        value: NFT_LISTING_PRICE
                    })
                ).wait(1)
                let receipt = await (await nifty.withdrawProceeds()).wait(1)
                let { gasUsed, effectiveGasPrice } = receipt
                let gasCost = gasUsed.mul(effectiveGasPrice)

                let withdrawerEndingBalance = await nifty.provider.getBalance(
                    deployer
                )

                expect(withdrawerEndingBalance).to.equal(
                    withdrawerStartingBalance
                        .add(NFT_LISTING_PRICE)
                        .sub(gasCost)
                )
            })
        })
    })
}
