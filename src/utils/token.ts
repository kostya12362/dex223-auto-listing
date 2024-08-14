/* eslint-disable prefer-const */
import { ERC20andERC223 } from '../types/AutoListingsRegistry/ERC20andERC223'
import { ERC20andERC223SymbolBytes } from '../types/AutoListingsRegistry/ERC20andERC223SymbolBytes'
import { ERC20andERC223NameBytes } from '../types/AutoListingsRegistry/ERC20andERC223NameBytes'
import { AutoListing } from '../types/AutoListingsRegistry/AutoListing'
import { getStaticDefinition, STATIC_TOKEN_DEFINITIONS, StaticTokenDefinition } from './staticTokenDefinition'
import { BigInt, Address } from '@graphprotocol/graph-ts'
import { isNullEthValue } from '.'
import { tokenConverterContract, ADDRESS_ZERO } from './constants'

export function getTokenId(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  return `${tokenAddressERC20.toHexString()}-${tokenAddressERC223.toHexString()}`
}

export function getTokenListedId(tokenAddressERC20: Address, tokenAddressERC223: Address, listedBy: Address): string {
  return `${getTokenId(tokenAddressERC20, tokenAddressERC223)}-${listedBy.toHexString()}`
}

export function fetchTokenSymbolSlim(
  tokenAddress: Address,
  staticTokenDefinitions: StaticTokenDefinition[] = STATIC_TOKEN_DEFINITIONS
): string {
  const contract = ERC20andERC223.bind(tokenAddress)
  const contractSymbolBytes = ERC20andERC223SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  const symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    const symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      } else {
        // try with the static definition
        const staticTokenDefinition = getStaticDefinition(tokenAddress, staticTokenDefinitions)
        if (staticTokenDefinition != null) {
          symbolValue = staticTokenDefinition.symbol
        }
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function fetchTokenNameSlim(
  tokenAddress: Address,
  staticTokenDefinitions: StaticTokenDefinition[] = STATIC_TOKEN_DEFINITIONS
): string {
  const contract = ERC20andERC223.bind(tokenAddress)
  const contractNameBytes = ERC20andERC223NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  const nameResult = contract.try_name()
  if (nameResult.reverted) {
    const nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      } else {
        // try with the static definition
        const staticTokenDefinition = getStaticDefinition(tokenAddress, staticTokenDefinitions)
        if (staticTokenDefinition != null) {
          nameValue = staticTokenDefinition.name
        }
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenDecimalsSlim(
  tokenAddress: Address,
  staticTokenDefinitions: StaticTokenDefinition[] = STATIC_TOKEN_DEFINITIONS
): BigInt | null {
  const contract = ERC20andERC223.bind(tokenAddress)
  // try types uint8 for decimals
  const decimalResult = contract.try_decimals()

  if (!decimalResult.reverted) {
    // Приведение u8 к i32 перед передачей в BigInt.fromI32
    // console.log()
    // const decimals = BigInt.fromI32(decimalResult.value)
    if (decimalResult.value.lt(BigInt.fromI32(255))) {
      return decimalResult.value
    }
  } else {
    // try with the static definition
    const staticTokenDefinition = getStaticDefinition(tokenAddress, staticTokenDefinitions)
    if (staticTokenDefinition) {
      return staticTokenDefinition.decimals
    }
  }

  return null
}

export function fetchTokenSymbol(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  let value = fetchTokenSymbolSlim(tokenAddressERC20)
  if (value == 'unknown') {
    return fetchTokenSymbolSlim(tokenAddressERC223)
  }
  return value
}

export function fetchTokenName(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  let value = fetchTokenNameSlim(tokenAddressERC20)
  if (value == 'unknown') {
    return fetchTokenNameSlim(tokenAddressERC223)
  }
  return value
}

export function fetchTokenDecimals(
  tokenAddressERC20: Address,
  tokenAddressERC223: Address,
  staticTokenDefinitions: StaticTokenDefinition[] = STATIC_TOKEN_DEFINITIONS
): BigInt | null {
  const value = fetchTokenDecimalsSlim(tokenAddressERC20, staticTokenDefinitions)
  if (value === null) {
    return fetchTokenDecimalsSlim(tokenAddressERC223, staticTokenDefinitions)
  }
  return value
}

export function fetchNameAutoListing(autoListingAddress: Address): string {
  let contract = AutoListing.bind(autoListingAddress)
  let nameValue = 'unknown'
  const nameResult = contract.try_name()
  if (!nameResult.reverted) {
    nameValue = nameResult.value
  }
  return nameValue
}

export function fetchOwnerAutoListing(autoListingAddress: Address): string | null {
  let contract = AutoListing.bind(autoListingAddress)
  let ownerValue: string | null = null // Указываем, что переменная может быть строкой или null
  const ownerResult = contract.try_owner()
  if (!ownerResult.reverted) {
    ownerValue = ownerResult.value.toHexString() // toHexString() возвращает строку
  }
  return ownerValue
}

export function fetchTokenInConverter(address: Address): boolean  {
  // Try getting ERC223 wrapper
  let resultERC223 = tokenConverterContract.try_getERC223WrapperFor(address)
  if (!resultERC223.reverted) {
    return resultERC223.value.getValue0().toHexString() != ADDRESS_ZERO
  }

  // Try getting ERC20 wrapper
  let resultERC20 = tokenConverterContract.try_getERC20WrapperFor(address)
  if (!resultERC20.reverted) {
    return resultERC20.value.getValue0().toHexString() != ADDRESS_ZERO
  }

  return false
}
