import { log } from "@graphprotocol/graph-ts";
import { NFT, Wearable as WearableEntity } from "../../generated/schema";
import { getCatalystBase } from "../catalyst";
import * as categories from "../../data/wearables/categories";
import { Wearable } from "../../data/wearables/Wearable";

export function buildWearableFromNFT(nft: NFT): WearableEntity {
  let wearableId = getWearableIdFromTokenURI(nft.tokenURI!);
  if (wearableId == "") {
    log.error("Coud not get a wearable id from tokenURI {} and nft {}", [nft.tokenURI!, nft.id]);
    return new WearableEntity("");
  }

  let allCollections: Wearable[][] = [];
  let collectionNames: string[] = [];
  for (let i = 0; i < allCollections.length; i++) {
    let wearable = findWearable(wearableId, allCollections[i]);
    if (wearable.id == wearableId) {
      wearable.id = nft.id;
      wearable.collection = collectionNames[i];
      wearable.owner = nft.owner;
      return wearable;
    }
  }

  log.error("Coud not find a wearable for the id {} found on the tokenURI {} and nft {}", [
    wearableId,
    nft.tokenURI!,
    nft.id,
  ]);
  return new WearableEntity("");
}

export function getWearableImage(wearable: WearableEntity): string {
  let baseURI = getCatalystBase();
  let urn = getWearableURN(wearable);

  return baseURI + "/lambdas/collections/contents/" + urn + "/thumbnail";
}

export function getWearableURN(wearable: WearableEntity): string {
  return "urn:memetaverse:nebulas:collections:" + wearable.collection + ":" + wearable.representationId;
}

export function isWearableHead(wearable: WearableEntity): boolean {
  let category = wearable.category;
  return (
    category == categories.EYEBROWS ||
    category == categories.EYES ||
    category == categories.FACIAL_HAIR ||
    category == categories.HAIR ||
    category == categories.MOUTH
  );
}

export function isWearableAccessory(wearable: WearableEntity): boolean {
  let category = wearable.category;
  return (
    category == categories.EARRING ||
    category == categories.EYEWEAR ||
    category == categories.HAT ||
    category == categories.HELMET ||
    category == categories.MASK ||
    category == categories.TIARA ||
    category == categories.TOP_HEAD
  );
}

function findWearable(id: string, collection: Wearable[]): WearableEntity {
  for (let i = 0; i < collection.length; i++) {
    let representation = collection[i];
    if (id == representation.id) {
      // TODO: representation.toEntity()
      let wearable = new WearableEntity(id);
      wearable.representationId = representation.id;
      wearable.name = representation.name;
      wearable.description = representation.description;
      wearable.category = representation.category;
      wearable.rarity = representation.rarity;
      wearable.bodyShapes = representation.bodyShapes;
      return wearable;
    }
  }

  return new WearableEntity("");
}

export function getWearableIdFromTokenURI(tokenURI: string): string {
  let splitted = tokenURI.split("/");
  if (splitted.length == 11 || splitted.length == 5) {
    let ids = splitted.slice(-2);
    return ids[0];
  }

  return "";
}
