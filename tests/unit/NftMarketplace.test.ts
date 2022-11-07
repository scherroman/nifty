import { expect } from 'chai'
import { BigNumber, ContractTransaction, ContractReceipt } from 'ethers'
import { ethers, network, deployments, getNamedAccounts } from 'hardhat'

import { NftMarketplace, BasicNft } from '../../typechain-types'
import { DEVELOPMENT_CHAINS } from '../../configuration/chainConfiguration'

const NFT_LISTING_PRICE = ethers.utils.parseEther('0.1')

if (DEVELOPMENT_CHAINS.includes(network.name)) {
    describe('NftMarketplace', () => {
        let nftMarketplace: NftMarketplace
        let userNftMarketPlace: NftMarketplace
        let basicNft: BasicNft
        let deployer: string
        let user: string
        let nftAddress: string
        let nftId: BigNumber
        beforeEach(async () => {
            await deployments.fixture(['tests', 'all'])
            nftMarketplace = await ethers.getContract(
                'NftMarketplace',
                deployer
            )
            userNftMarketPlace = await ethers.getContract<NftMarketplace>(
                'NftMarketplace',
                user
            )
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
            await (
                await basicNft.approve(nftMarketplace.address, nftId)
            ).wait(1)
            let transaction = await nftMarketplace.listNft(
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
                    nftMarketplace.listNft(nftAddress, nftId, 0)
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'ListingPriceNotProvided'
                )
            })

            it('reverts if the lister is not the owner of the nft', async () => {
                let userNftMarketPlace =
                    await ethers.getContract<NftMarketplace>(
                        'NftMarketplace',
                        user
                    )
                await expect(
                    userNftMarketPlace.listNft(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE
                    )
                ).to.be.revertedWithCustomError(nftMarketplace, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not approved for the marketplace', async () => {
                await expect(
                    nftMarketplace.listNft(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'NftNotApprovedForMarketPlace'
                )
            })

            it('reverts if the nft is already listed', async () => {
                await listBasicNft()
                await expect(
                    nftMarketplace.listNft(nftAddress, nftId, NFT_LISTING_PRICE)
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'NftAlreadyListed'
                )
            })

            it('lists the nft', async () => {
                let { transaction, receipt } = await listBasicNft()
                let listing = await nftMarketplace.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nftMarketplace.numberOfListings()

                let nftListedEvent = receipt.events?.find(
                    (event) => event.event === 'NftListed'
                )

                expect(listing.price).to.equal(NFT_LISTING_PRICE)
                expect(listing.seller).to.equal(deployer)
                expect(numberOfListings).to.equal(1)
                await expect(transaction).to.emit(nftMarketplace, 'NftListed')
                expect(nftListedEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftListedEvent?.args?.nftId).to.equal(nftId)
                expect(nftListedEvent?.args?.price).to.equal(NFT_LISTING_PRICE)
                expect(nftListedEvent?.args?.seller).to.equal(deployer)
            })
        })

        describe('updateListing', () => {
            it('reverts if a listing price is not provided', async () => {
                await expect(
                    nftMarketplace.updateListing(nftAddress, nftId, 0)
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'ListingPriceNotProvided'
                )
            })

            it('reverts if the updater is not the owner of the nft', async () => {
                await expect(
                    userNftMarketPlace.updateListing(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE.add(1)
                    )
                ).to.be.revertedWithCustomError(nftMarketplace, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not listed', async () => {
                await expect(
                    nftMarketplace.updateListing(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE
                    )
                ).to.be.revertedWithCustomError(nftMarketplace, 'NftNotListed')
            })

            it('updates the listing', async () => {
                await listBasicNft()
                let newPrice = NFT_LISTING_PRICE.add(NFT_LISTING_PRICE)

                let transaction = await nftMarketplace.updateListing(
                    nftAddress,
                    nftId,
                    newPrice
                )
                let receipt = await transaction.wait(1)
                let listingUpdatedEvent = receipt.events?.find(
                    (event) => event.event === 'ListingUpdated'
                )

                let listing = await nftMarketplace.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                expect(listing.price).to.equal(newPrice)
                await expect(transaction).to.emit(
                    nftMarketplace,
                    'ListingUpdated'
                )
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
                    await userNftMarketPlace.updateListing(
                        nftAddress,
                        nftId,
                        NFT_LISTING_PRICE
                    )
                ).wait(1)
                let listing = await nftMarketplace.listingByNftIdByNftAddress(
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
                    userNftMarketPlace.unlistNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(nftMarketplace, 'NotOwnerOfNft')
            })

            it('reverts if the nft is not listed', async () => {
                await expect(
                    nftMarketplace.unlistNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(nftMarketplace, 'NftNotListed')
            })

            it('unlists the nft', async () => {
                await listBasicNft()
                let transaction = await nftMarketplace.unlistNft(
                    nftAddress,
                    nftId
                )
                let receipt = await transaction.wait(1)
                let nftUnlistedEvent = receipt.events?.find(
                    (event) => event.event === 'NftUnlisted'
                )

                let listing = await nftMarketplace.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nftMarketplace.numberOfListings()

                expect(listing.price).to.equal(0)
                expect(listing.seller).to.equal(
                    '0x0000000000000000000000000000000000000000'
                )
                expect(numberOfListings).to.equal(0)
                await expect(transaction).to.emit(nftMarketplace, 'NftUnlisted')
                expect(nftUnlistedEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftUnlistedEvent?.args?.nftId).to.equal(nftId)
            })
        })

        describe('buyNft', () => {
            it('reverts if the nft is not listed', async () => {
                await expect(
                    nftMarketplace.buyNft(
                        '0x0000000000000000000000000000000000000000',
                        nftId
                    )
                ).to.be.revertedWithCustomError(nftMarketplace, 'NftNotListed')
                await expect(
                    nftMarketplace.buyNft(nftAddress, '1337')
                ).to.be.revertedWithCustomError(nftMarketplace, 'NftNotListed')
            })

            it('reverts if the nft price is not paid', async () => {
                await listBasicNft()
                await expect(
                    nftMarketplace.buyNft(nftAddress, nftId)
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'ListingPriceNotPaid'
                )
            })

            it("updates the seller's proceeds, unlists the nft, and transfers the nft to the buyer", async () => {
                await listBasicNft()
                let transaction = await userNftMarketPlace.buyNft(
                    nftAddress,
                    nftId,
                    {
                        value: NFT_LISTING_PRICE
                    }
                )
                let receipt = await transaction.wait(1)
                let nftBoughtEvent = receipt.events?.find(
                    (event) => event.event === 'NftBought'
                )

                let sellerProceeds = await nftMarketplace.proceeds(deployer)
                let listing = await nftMarketplace.listingByNftIdByNftAddress(
                    nftAddress,
                    nftId
                )
                let numberOfListings = await nftMarketplace.numberOfListings()
                let newOwner = await basicNft.ownerOf(nftId)

                expect(sellerProceeds).to.equal(NFT_LISTING_PRICE)
                expect(listing.price).to.equal(0)
                expect(listing.seller).to.equal(
                    '0x0000000000000000000000000000000000000000'
                )
                expect(numberOfListings).to.equal(0)
                expect(newOwner).to.equal(user)
                await expect(transaction).to.emit(nftMarketplace, 'NftBought')
                expect(nftBoughtEvent?.args?.nftAddress).to.equal(nftAddress)
                expect(nftBoughtEvent?.args?.nftId).to.equal(nftId)
                expect(nftBoughtEvent?.args?.buyer).to.equal(user)
                expect(nftBoughtEvent?.args?.price).to.equal(NFT_LISTING_PRICE)
            })
        })

        describe('withdrawProceeds', () => {
            it('reverts if the withdrawer has no proceeds', async () => {
                await expect(
                    nftMarketplace.withdrawProceeds()
                ).to.be.revertedWithCustomError(
                    nftMarketplace,
                    'NoProceedsToWithdraw'
                )
            })

            it("withdraws proceeds to the withdrawer's account", async () => {
                await listBasicNft()

                let withdrawerStartingBalance =
                    await nftMarketplace.provider.getBalance(deployer)

                await (
                    await userNftMarketPlace.buyNft(nftAddress, nftId, {
                        value: NFT_LISTING_PRICE
                    })
                ).wait(1)
                let receipt = await (
                    await nftMarketplace.withdrawProceeds()
                ).wait(1)
                let { gasUsed, effectiveGasPrice } = receipt
                let gasCost = gasUsed.mul(effectiveGasPrice)

                let withdrawerEndingBalance =
                    await nftMarketplace.provider.getBalance(deployer)

                expect(withdrawerEndingBalance).to.equal(
                    withdrawerStartingBalance
                        .add(NFT_LISTING_PRICE)
                        .sub(gasCost)
                )
            })
        })
    })
}
