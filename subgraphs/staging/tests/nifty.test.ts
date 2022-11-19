import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { ListingUpdated } from "../generated/schema"
import { ListingUpdated as ListingUpdatedEvent } from "../generated/Nifty/Nifty"
import { handleListingUpdated } from "../src/nifty"
import { createListingUpdatedEvent } from "./nifty-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let nftAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let nftId = BigInt.fromI32(234)
    let price = BigInt.fromI32(234)
    let seller = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newListingUpdatedEvent = createListingUpdatedEvent(
      nftAddress,
      nftId,
      price,
      seller
    )
    handleListingUpdated(newListingUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ListingUpdated created and stored", () => {
    assert.entityCount("ListingUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ListingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ListingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "nftId",
      "234"
    )
    assert.fieldEquals(
      "ListingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "price",
      "234"
    )
    assert.fieldEquals(
      "ListingUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "seller",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
