import { BigInt, log, Address } from "@graphprotocol/graph-ts";

import { ZERO_ADDRESS } from "../account";
import { NFT, Order } from "../../generated/schema";
import { Collection } from "../../generated/templates/Collection/Collection";

export function isMint(to: string): boolean {
  return to == ZERO_ADDRESS;
}

export function getNFTId(contractAddress: string, id: string): string {
  return contractAddress + "-" + id;
}

export function addNFTOrderProperties(nft: NFT, order: Order): NFT {
  nft.activeOrder = order.id;
  nft.searchOrderStatus = order.status;
  nft.searchOrderPrice = order.price;
  nft.searchOrderCreatedAt = order.createdAt;
  nft.searchOrderExpiresAt = order.expiresAt;
  return nft;
}

export function clearNFTOrderProperties(nft: NFT): NFT {
  nft.activeOrder = "";
  nft.searchOrderStatus = null;
  nft.searchOrderPrice = null;
  nft.searchOrderCreatedAt = null;
  nft.searchOrderExpiresAt = null;
  return nft;
}

export function getTokenURI(collectionAddress: Address, tokenId: BigInt): string {
  let erc721 = Collection.bind(collectionAddress);
  let tokenURICallResult = erc721.try_tokenURI(tokenId);

  let tokenURI = "";

  if (tokenURICallResult.reverted) {
    log.warning("tokenURI reverted for tokenID: {} contract: {}", [
      tokenId.toString(),
      collectionAddress.toHexString(),
    ]);
  } else {
    tokenURI = tokenURICallResult.value;
  }

  return tokenURI;
}
