import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { TokenListed } from "../generated/AutoListingsRegistry/AutoListingsRegistry"

export function createTokenListedEvent(
  _listedBy: Address,
  _tokenERC20: Address,
  _tokenERC223: Address
): TokenListed {
  let tokenListedEvent = changetype<TokenListed>(newMockEvent())

  tokenListedEvent.parameters = new Array()

  tokenListedEvent.parameters.push(
    new ethereum.EventParam("_listedBy", ethereum.Value.fromAddress(_listedBy))
  )
  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenERC20",
      ethereum.Value.fromAddress(_tokenERC20)
    )
  )
  tokenListedEvent.parameters.push(
    new ethereum.EventParam(
      "_tokenERC223",
      ethereum.Value.fromAddress(_tokenERC223)
    )
  )

  return tokenListedEvent
}
