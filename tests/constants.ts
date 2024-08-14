import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent, assert } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, TOKEN_CONVERTER_ADDRESS } from '../src/utils/constants'
// Token fixtures for mainnet
const USDC_MAINNET_ADDRESS_ERC20 = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase()
const USDC_MAINNET_ADDRESS_ERC223 = '0x247c52296051F2bd9f18834812e5c3a0B200A351'.toLowerCase()

const WETH_MAINNET_ADDRESS_ERC20 = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase()
const WETH_MAINNET_ADDRESS_ERC223 = '0x8D68273683B545BD31C956f51a336E3eEb45eAa5'.toLowerCase()

const WBTC_MAINNET_ADDRESS_ERC20 = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'.toLowerCase()
const WBTC_MAINNET_ADDRESS_ERC223 = '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'.toLowerCase()

export class TokenFixture {
  addressERC20: string
  addressERC223: string
  symbol: string
  name: string
  decimals: string
  inConverter: boolean
}

export class AutoListingFixture {
  address: string
  name: string
  url: string
  metadata: string
  owner: string
}

export const AutoListingFirstFixture: AutoListingFixture = {
  address: '0x0000000000000000000000000000000000000004',
  name: 'First AutoListing',
  url: 'https://first-autolisting.com',
  metadata: '',
  owner: '0x0000000000000000000000000000000000000006'
}

export const AutoListingSecondFixture: AutoListingFixture = {
  address: '0x0000000000000000000000000000000000000005',
  name: 'Second AutoListing',
  url: 'https://s-autolisting.com',
  metadata: '5b4465786172616e5d20546573742074657874',
  owner: '0x0000000000000000000000000000000000000222'
}

export const USDC_MAINNET_FIXTURE: TokenFixture = {
  addressERC20: USDC_MAINNET_ADDRESS_ERC20,
  addressERC223: USDC_MAINNET_ADDRESS_ERC223,
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: '6',
  inConverter: true
}

export const WETH_MAINNET_FIXTURE: TokenFixture = {
  addressERC20: WETH_MAINNET_ADDRESS_ERC20,
  addressERC223: WETH_MAINNET_ADDRESS_ERC223,
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: '18',
  inConverter: true
}

export const WBTC_MAINNET_FIXTURE: TokenFixture = {
  addressERC20: WBTC_MAINNET_ADDRESS_ERC20,
  addressERC223: WBTC_MAINNET_ADDRESS_ERC223,
  symbol: 'WBTC',
  name: 'Wrapped Bitcoin',
  decimals: '8',
  inConverter: false
}

export const ETH_MAINNET_FIXTURE: TokenFixture = {
  addressERC20: ADDRESS_ZERO,
  addressERC223: ADDRESS_ZERO,
  symbol: 'ETH',
  name: 'Ether',
  decimals: '18',
  inConverter: false
}

export const createAutoListing = (autoListing: AutoListingFixture, owner: Address | null = null): void => {
  createMockedFunction(Address.fromString(autoListing.address), 'name', 'name():(string)').returns([
    ethereum.Value.fromString(autoListing.name)
  ])
  if (owner) {
    createMockedFunction(Address.fromString(autoListing.address), 'owner', 'owner():(address)').returns([
      ethereum.Value.fromAddress(owner)
    ])
  }
}

// Function to create a mocked token using matchstick-as
export const createAddToken = (token: TokenFixture): void => {
  const tokenFixtures = [token]

  for (let i = 0; i < tokenFixtures.length; i++) {
    const token = tokenFixtures[i]
    const addresses = [token.addressERC20, token.addressERC223]

    for (let j = 0; j < addresses.length; j++) {
      const address = addresses[j]

      createMockedFunction(Address.fromString(address), 'symbol', 'symbol():(string)').returns([
        ethereum.Value.fromString(token.symbol)
      ])

      createMockedFunction(Address.fromString(address), 'name', 'name():(string)').returns([
        ethereum.Value.fromString(token.name)
      ])

      createMockedFunction(Address.fromString(address), 'decimals', 'decimals():(uint32)').returns([
        ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token.decimals))
      ])
    }

    // Mocking token converter contract for ERC223
    createMockedFunction(
      Address.fromString(TOKEN_CONVERTER_ADDRESS),
      'getERC223WrapperFor',
      'getERC223WrapperFor(address):(address,string)'
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token.addressERC20))])
      .returns([
        ethereum.Value.fromAddress(Address.fromString(token.inConverter ? token.addressERC223 : ADDRESS_ZERO)),
        ethereum.Value.fromString(token.inConverter ? 'ERC-223' : 'Error')
      ])

    // Mocking token converter contract for ERC20
    createMockedFunction(
      Address.fromString(TOKEN_CONVERTER_ADDRESS),
      'getERC20WrapperFor',
      'getERC20WrapperFor(address):(address,string)'
    )
      .withArgs([ethereum.Value.fromAddress(Address.fromString(token.addressERC20))])
      .returns([
        ethereum.Value.fromAddress(Address.fromString(token.inConverter ? token.addressERC223 : ADDRESS_ZERO)),
        ethereum.Value.fromString(token.inConverter ? 'ERC-20' : 'Error')
      ])
  }
}

// Универсальная функция для проверки полей объекта
// Typescript for Subgraphs do not support Record types so we use a 2D string array to represent the object instead.
export const assertObjectMatches = (entityType: string, id: string, obj: string[][]): void => {
  for (let i = 0; i < obj.length; i++) {
    assert.fieldEquals(entityType, id, obj[i][0], obj[i][1])
  }
}
