import { BigInt } from "@graphprotocol/graph-ts"

export let WIDTH = BigInt.fromI32(300)
export let HEIGHT = BigInt.fromI32(300)


export function decodeTokenId(tokenId: BigInt): BigInt[] {
    let x = tokenId.mod(WIDTH)
    let y = tokenId.div(HEIGHT)
    return [x, y]
}

