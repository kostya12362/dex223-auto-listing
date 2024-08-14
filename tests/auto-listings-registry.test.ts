// Импорт необходимых библиотек и обработчиков
import { test, assert, newMockEvent, describe, beforeAll } from 'matchstick-as/assembly/index'
import { ethereum, Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { handleTokenListed, handleListingContractUpdated, handleListingPrice } from '../src/auto-listings-registry'
import {
  TokenListed as TokenListedEvent,
  ListingPrice as ListingPriceEvent,
  ListingContractUpdated as ListingContractUpdatedEvent
} from '../src/types/AutoListingsRegistry/AutoListingsRegistry'
import {
  createAddToken,
  createAutoListing,
  TokenFixture,
  USDC_MAINNET_FIXTURE,
  WETH_MAINNET_FIXTURE,
  WBTC_MAINNET_FIXTURE,
  ETH_MAINNET_FIXTURE,
  AutoListingFirstFixture,
  AutoListingSecondFixture,
  assertObjectMatches
} from './constants'

// Mock function for TokenListed event
function createTokenListedEvent(listedBy: string, token: TokenFixture, blockTimestamp: BigInt): TokenListedEvent {
  const mockEvent = newMockEvent()
  const parameters = [
    new ethereum.EventParam('_listedBy', ethereum.Value.fromAddress(Address.fromString(listedBy))),
    new ethereum.EventParam('_tokenERC20', ethereum.Value.fromAddress(Address.fromString(token.addressERC20))),
    new ethereum.EventParam('_tokenERC223', ethereum.Value.fromAddress(Address.fromString(token.addressERC223)))
  ]

  mockEvent.block.timestamp = blockTimestamp
  const TokenListed = new TokenListedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    parameters,
    mockEvent.receipt
  )
  TokenListed.block.timestamp = blockTimestamp
  handleTokenListed(TokenListed)
  return TokenListed
}

function createListingContractUpdatedEvent(
  autolisting: string,
  url: string,
  metadata: string,
  owner: string,
  blockTimestamp: BigInt
): ListingContractUpdatedEvent {
  const mockEvent = newMockEvent()
  const parameters = [
    new ethereum.EventParam('_autolisting', ethereum.Value.fromAddress(Address.fromString(autolisting))),
    new ethereum.EventParam('_owner', ethereum.Value.fromAddress(Address.fromString(owner))),
    new ethereum.EventParam('_url', ethereum.Value.fromString(url)),
    new ethereum.EventParam('_metadata', ethereum.Value.fromBytes(Bytes.fromHexString(metadata)))
  ]
  const ListingContractUpdated = new ListingContractUpdatedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    parameters,
    mockEvent.receipt
  )
  ListingContractUpdated.block.timestamp = blockTimestamp
  handleListingContractUpdated(ListingContractUpdated)

  return ListingContractUpdated
}

function createListingPriceEvent(
  autolisting: string,
  price: BigInt,
  token: string,
  blockTimestamp: BigInt
): ListingPriceEvent {
  const mockEvent = newMockEvent()
  const parameters = [
    new ethereum.EventParam('_autolisting', ethereum.Value.fromAddress(Address.fromString(autolisting))),
    new ethereum.EventParam('_token', ethereum.Value.fromAddress(Address.fromString(token))),
    new ethereum.EventParam('_price', ethereum.Value.fromUnsignedBigInt(price))
  ]
  const ListingContractUpdated = new ListingPriceEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    parameters,
    mockEvent.receipt
  )

  ListingContractUpdated.block.timestamp = blockTimestamp
  handleListingPrice(ListingContractUpdated)

  return ListingContractUpdated
}

describe('handleSwap', () => {
  beforeAll(() => {
    createAddToken(USDC_MAINNET_FIXTURE)
    createAddToken(WBTC_MAINNET_FIXTURE)
    createAddToken(WETH_MAINNET_FIXTURE)
    createAddToken(ETH_MAINNET_FIXTURE)
  })

  // Тест для handleListingContractUpdated
  test('handleListingContractUpdated creates and updates AutoListing entity', () => {
    const lastUpdate = BigInt.fromI32(1623430500)
    createAutoListing(AutoListingFirstFixture)

    createListingContractUpdatedEvent(
      AutoListingFirstFixture.address,
      AutoListingFirstFixture.url,
      AutoListingFirstFixture.metadata,
      AutoListingFirstFixture.owner,
      lastUpdate
    )

    assertObjectMatches('AutoListing', AutoListingFirstFixture.address, [
      ['url', AutoListingFirstFixture.url],
      ['meta', `0x${AutoListingFirstFixture.metadata}`],
      ['owner', AutoListingFirstFixture.owner],
      ['name', AutoListingFirstFixture.name],
      ['lastUpdated', lastUpdate.toString()],
      ['totalTokens', '0']
    ])
  })

  //Test for handleListingPrice
  test('handleListingPrice updates PriceDetail entity', () => {
    const lastUpdate = BigInt.fromI32(1623430500)
    createAutoListing(AutoListingFirstFixture)

    createListingContractUpdatedEvent(
      AutoListingFirstFixture.address,
      AutoListingFirstFixture.url,
      AutoListingFirstFixture.metadata,
      AutoListingFirstFixture.owner,
      lastUpdate
    )
    createListingPriceEvent(
      AutoListingFirstFixture.address,
      BigInt.fromI32(100),
      USDC_MAINNET_FIXTURE.addressERC20,
      lastUpdate
    )

    assertObjectMatches('PriceDetail', `${AutoListingFirstFixture.address}-${USDC_MAINNET_FIXTURE.addressERC20}`, [
      ['price', '100'],
      ['id', `${AutoListingFirstFixture.address}-${USDC_MAINNET_FIXTURE.addressERC20}`]
    ])
    assertObjectMatches('FeeToken', USDC_MAINNET_FIXTURE.addressERC20, [
      ['address', USDC_MAINNET_FIXTURE.addressERC20],
      ['symbol', USDC_MAINNET_FIXTURE.symbol],
      ['name', USDC_MAINNET_FIXTURE.name],
      ['decimals', USDC_MAINNET_FIXTURE.decimals.toString()]
    ])
    createListingPriceEvent(
      AutoListingFirstFixture.address,
      BigInt.fromI32(100),
      WETH_MAINNET_FIXTURE.addressERC20,
      lastUpdate
    )
    assertObjectMatches('PriceDetail', `${AutoListingFirstFixture.address}-${WETH_MAINNET_FIXTURE.addressERC20}`, [
      ['price', '100'],
      ['id', `${AutoListingFirstFixture.address}-${WETH_MAINNET_FIXTURE.addressERC20}`]
    ])
    assertObjectMatches('FeeToken', WETH_MAINNET_FIXTURE.addressERC20, [
      ['id', WETH_MAINNET_FIXTURE.addressERC20],
      ['address', WETH_MAINNET_FIXTURE.addressERC20],
      ['symbol', WETH_MAINNET_FIXTURE.symbol],
      ['name', WETH_MAINNET_FIXTURE.name],
      ['decimals', WETH_MAINNET_FIXTURE.decimals.toString()]
    ])
    assert.entityCount('FeeToken', 2)
    assert.entityCount('PriceDetail', 2)
    createListingPriceEvent(
      AutoListingFirstFixture.address,
      BigInt.fromI32(0),
      WETH_MAINNET_FIXTURE.addressERC20,
      lastUpdate
    )
    assert.entityCount('FeeToken', 2)
    assert.entityCount('PriceDetail', 1)
  })

  // Test for handleTokenListed
  test('handleTokenListed creates Token entity', () => {
    const lastUpdate = BigInt.fromI32(1623430500)
    createAutoListing(AutoListingSecondFixture)

    createListingContractUpdatedEvent(
      AutoListingSecondFixture.address,
      AutoListingSecondFixture.url,
      AutoListingSecondFixture.metadata,
      AutoListingSecondFixture.owner,
      lastUpdate
    )
    const arrayTokenFixture = [USDC_MAINNET_FIXTURE, WBTC_MAINNET_FIXTURE, WETH_MAINNET_FIXTURE]
    for (let i = 0; i < arrayTokenFixture.length; i++) {
      let token = arrayTokenFixture[i]
      createTokenListedEvent(AutoListingSecondFixture.address, token, lastUpdate)
      assertObjectMatches('Token', `${token.addressERC20}-${token.addressERC223}`, [
        ['addressERC223', token.addressERC223],
        ['addressERC20', token.addressERC20],
        ['name', token.name],
        ['symbol', token.symbol],
        ['decimals', token.decimals.toString()]
      ])
    }
    assertObjectMatches('AutoListing', AutoListingSecondFixture.address, [
      ['url', AutoListingSecondFixture.url],
      ['meta', `0x${AutoListingSecondFixture.metadata}`],
      ['owner', AutoListingSecondFixture.owner],
      ['name', AutoListingSecondFixture.name],
      ['lastUpdated', lastUpdate.toString()],
      ['totalTokens', BigInt.fromI32(arrayTokenFixture.length).toString()]
    ])
  })
  test('handleTokenListed does not create Token entity if token already exists', () => {
    const lastUpdate = BigInt.fromI32(1623430500)
    createAutoListing(AutoListingSecondFixture)
    createListingContractUpdatedEvent(
      AutoListingSecondFixture.address,
      AutoListingSecondFixture.url,
      AutoListingSecondFixture.metadata,
      AutoListingSecondFixture.owner,
      lastUpdate
    )
    createListingPriceEvent(
      AutoListingSecondFixture.address,
      BigInt.fromI32(100),
      ETH_MAINNET_FIXTURE.addressERC20,
      lastUpdate
    )
    assertObjectMatches('PriceDetail', `${AutoListingSecondFixture.address}-${ETH_MAINNET_FIXTURE.addressERC20}`, [
      ['price', '100'],
      ['id', `${AutoListingSecondFixture.address}-${ETH_MAINNET_FIXTURE.addressERC20}`]
    ])
    assertObjectMatches('FeeToken', ETH_MAINNET_FIXTURE.addressERC20, [
      ['id', ETH_MAINNET_FIXTURE.addressERC20],
      ['address', ETH_MAINNET_FIXTURE.addressERC20],
      ['symbol', ETH_MAINNET_FIXTURE.symbol],
      ['name', ETH_MAINNET_FIXTURE.name],
      ['decimals', ETH_MAINNET_FIXTURE.decimals.toString()]
    ])
  })
})
