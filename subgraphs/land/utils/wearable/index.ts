import { log } from "@graphprotocol/graph-ts";
import { NFT, Wearable as WearableEntity } from "../../generated/schema";

import { getURNNetwork } from "../network";

// export function buildWearableFromNFT(nft: NFT): WearableEntity {
//     // https://wearable-api.decentraland.org/v2/standards/erc721-metadata/collections/halloween_2019/wearables/funny_skull_mask/1
//     let wearableId = getWearableIdFromTokenURI(nft.tokenURI!)
//     if (wearableId == '') {
//         log.error('Coud not get a wearable id from tokenURI {} and nft {}', [
//             nft.tokenURI!,
//             nft.id
//         ])
//         return new WearableEntity('')
//     }
// }

// export function getWearableIdFromTokenURI(tokenURI: string): string {
//     let splitted = tokenURI.split('/')

//     // https://wearable-api.decentraland.org/v2/standards/erc721-metadata/collections/halloween_2019/wearables/funny_skull_mask/1
//     // or
//     // dcl://halloween_2019/vampire_feet/55
//     if (splitted.length == 11 || splitted.length == 5) {
//         let ids = splitted.slice(-2)
//         return ids[0]
//     }

//     return ''
// }

// export function getWearableURN(wearable: WearableEntity): string {
//     return 'urn:memetaverse:' + getURNNetwork() + ':collections-v1:' + wearable.collection + ':' + wearable.representationId
// }

// export function isWearableHead(wearable: WearableEntity): boolean {
//     let category = wearable.category
//     return (
//         category == categories.EYEBROWS ||
//         category == categories.EYES ||
//         category == categories.FACIAL_HAIR ||
//         category == categories.HAIR ||
//         category == categories.MOUTH
//     )
// }

// export function isWearableAccessory(wearable: WearableEntity): boolean {
//     let category = wearable.category
//     return (
//         category == categories.EARRING ||
//         category == categories.EYEWEAR ||
//         category == categories.HAT ||
//         category == categories.HELMET ||
//         category == categories.MASK ||
//         category == categories.TIARA ||
//         category == categories.TOP_HEAD
//     )
// }
