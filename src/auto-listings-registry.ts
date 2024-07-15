import { TokenListed as TokenListedEvent } from './types/AutoListingsRegistry/AutoListingsRegistry'
import { TokenListed, Token, AutoListing } from './types/schema'
import {
  fetchTokenDecimals,
  fetchTokenSymbol,
  fetchTokenName,
  getTokenId,
  getTokenListedId,
  fetchNameAutoListing,
  fetchOwnerAutoListing
} from './utils/token'
import { ZERO_BI, ONE_BI } from './utils/constants'

export function handleTokenListed(event: TokenListedEvent): void {
  const id = getTokenId(event.params._tokenERC20, event.params._tokenERC223)
  const addressERC20 = event.params._tokenERC20
  const addressERC223 = event.params._tokenERC223
  const listedBy = event.params._listedBy
  const timestamp = event.block.timestamp

  let token = Token.load(id)
  if (token == null) {
    token = new Token(id)
    token.addressERC20 = addressERC20.toHexString()
    token.addressERC223 = addressERC223.toHexString()
    token.decimals = fetchTokenDecimals(addressERC20, addressERC223)
    token.symbol = fetchTokenSymbol(addressERC20, addressERC223)
    token.name = fetchTokenName(addressERC20, addressERC223)
    token.numberAdditions = ZERO_BI
  }
  token.numberAdditions = token.numberAdditions.plus(ONE_BI)
  token.save()

  let autoListing = AutoListing.load(listedBy.toHexString())
  if (autoListing == null) {
    autoListing = new AutoListing(listedBy.toHexString())
    autoListing.totalTokens = ZERO_BI
    autoListing.owner = fetchOwnerAutoListing(listedBy)
    autoListing.name = fetchNameAutoListing(listedBy)
  }
  autoListing.totalTokens = autoListing.totalTokens.plus(ONE_BI)
  autoListing.lastUpdated = timestamp
  autoListing.save()

  const listedById = getTokenListedId(addressERC20, addressERC223, listedBy)
  let tokenListed = TokenListed.load(listedById)
  if (tokenListed == null) {
    tokenListed = new TokenListed(listedById)
    tokenListed.timestamp = timestamp
    tokenListed.token = token.id
    tokenListed.authListing = autoListing.id
    tokenListed.save()
  }
}
