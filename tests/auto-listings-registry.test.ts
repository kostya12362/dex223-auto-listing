import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { TokenListed } from "../generated/schema"
import { TokenListed as TokenListedEvent } from "../generated/AutoListingsRegistry/AutoListingsRegistry"
import { handleTokenListed } from "../src/auto-listings-registry"
import { createTokenListedEvent } from "./auto-listings-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _listedBy = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _tokenERC20 = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let _tokenERC223 = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newTokenListedEvent = createTokenListedEvent(
      _listedBy,
      _tokenERC20,
      _tokenERC223
    )
    handleTokenListed(newTokenListedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("TokenListed created and stored", () => {
    assert.entityCount("TokenListed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "TokenListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_listedBy",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "TokenListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_tokenERC20",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "TokenListed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_tokenERC223",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
