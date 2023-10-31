import { BigInt } from "@graphprotocol/graph-ts";

export let WIDTH = BigInt.fromI32(300);
export let HEIGHT = BigInt.fromI32(300);
export let HAFT = BigInt.fromI32(150);

export function decodeTokenId(tokenId: BigInt): BigInt[] {
  let x = tokenId.mod(WIDTH).minus(HAFT);
  let y = tokenId.div(HEIGHT).minus(HAFT);
  return [x, y];
}
