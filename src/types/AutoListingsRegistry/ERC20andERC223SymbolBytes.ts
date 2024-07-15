// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class ERC20andERC223SymbolBytes extends ethereum.SmartContract {
  static bind(address: Address): ERC20andERC223SymbolBytes {
    return new ERC20andERC223SymbolBytes("ERC20andERC223SymbolBytes", address);
  }

  symbol(): Bytes {
    let result = super.call("symbol", "symbol():(bytes32)", []);

    return result[0].toBytes();
  }

  try_symbol(): ethereum.CallResult<Bytes> {
    let result = super.tryCall("symbol", "symbol():(bytes32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }
}