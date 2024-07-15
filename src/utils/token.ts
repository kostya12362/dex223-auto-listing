/* eslint-disable prefer-const */
import { ERC20andERC223 } from '../types/AutoListingsRegistry/ERC20andERC223'
import { ERC20andERC223SymbolBytes } from '../types/AutoListingsRegistry/ERC20andERC223SymbolBytes'
import { ERC20andERC223NameBytes } from '../types/AutoListingsRegistry/ERC20andERC223NameBytes'
import { AutoListing } from '../types/AutoListingsRegistry/AutoListing'
import { StaticTokenDefinition } from './staticTokenDefinition'
import { BigInt, Address } from '@graphprotocol/graph-ts'
import { isNullEthValue } from '.'
import { ZERO_BI } from './constants'
import { log } from '@graphprotocol/graph-ts'

export function getTokenId(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  return `${tokenAddressERC20.toHexString()}-${tokenAddressERC223.toHexString()}`
}

export function getTokenListedId(tokenAddressERC20: Address, tokenAddressERC223: Address, listedBy: Address): string {
  return `${getTokenId(tokenAddressERC20, tokenAddressERC223)}-${listedBy.toHexString()}`
}

function _fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20andERC223.bind(tokenAddress)
  let contractSymbolBytes = ERC20andERC223SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
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

function _fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20andERC223.bind(tokenAddress)
  let contractNameBytes = ERC20andERC223NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      } else {
        // try with the static definition
        let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
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

function _fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20andERC223.bind(tokenAddress)
  // try types uint8 for decimals
  let decimalValue = 0
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  } else {
    // try with the static definition
    let staticTokenDefinition = StaticTokenDefinition.fromAddress(tokenAddress)
    if (staticTokenDefinition != null) {
      return staticTokenDefinition.decimals
    }
  }

  return BigInt.fromI32(decimalValue)
}

export function fetchTokenSymbol(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  let value = _fetchTokenSymbol(tokenAddressERC20)
  if (value == 'unknown') {
    return _fetchTokenSymbol(tokenAddressERC223)
  }
  return value
}

export function fetchTokenName(tokenAddressERC20: Address, tokenAddressERC223: Address): string {
  let value = _fetchTokenName(tokenAddressERC20)
  if (value == 'unknown') {
    return _fetchTokenName(tokenAddressERC223)
  }
  return value
}

function checkTokenExists(tokenAddress: Address): boolean {
  let contract = ERC20andERC223.bind(tokenAddress)
  let decimalResult = contract.try_decimals()
  // Проверяем, был ли вызов успешным
  return !decimalResult.reverted
}

export function fetchTokenDecimals(tokenAddressERC20: Address, tokenAddressERC223: Address): BigInt {
  // Сначала проверяем ERC20 адрес
  if (checkTokenExists(tokenAddressERC20)) {
    let value = _fetchTokenDecimals(tokenAddressERC20)
    log.info('fetchTokenDecimals tokenAddressERC20: {} value: {}', [tokenAddressERC20.toHexString(), value.toString()])
    return value
  }

  // Если ERC20 токен не существует, проверяем ERC223
  if (checkTokenExists(tokenAddressERC223)) {
    let value = _fetchTokenDecimals(tokenAddressERC223)
    log.info('fetchTokenDecimals tokenAddressERC223: {} value: {}', [
      tokenAddressERC223.toHexString(),
      value.toString()
    ])
    return value
  }

  // Если ни один из токенов не существует, возвращаем значение по умолчанию
  log.debug('Both token addresses do not exist or are invalid ERC20/ERC223 tokens {}', [
    tokenAddressERC20.toHexString(),
    tokenAddressERC223.toHexString()
  ])
  return ZERO_BI
}

export function fetchNameAutoListing(autoListingAddress: Address): string {
  let contract = AutoListing.bind(autoListingAddress)
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (!nameResult.reverted) {
    nameValue = nameResult.value
  }
  return nameValue
}

export function fetchOwnerAutoListing(autoListingAddress: Address): string | null {
  let contract = AutoListing.bind(autoListingAddress)
  let ownerValue: string | null = null // Указываем, что переменная может быть строкой или null
  let ownerResult = contract.try_owner()
  if (!ownerResult.reverted) {
    ownerValue = ownerResult.value.toHexString() // toHexString() возвращает строку
  }
  return ownerValue
}
