import { BigInt, log } from "@graphprotocol/graph-ts";
import * as addresses from "../../data/addresses";
import { NFT, Order } from "../../generated/schema";
import * as orderStatus from "../order/status";
import { ERC721, Transfer } from "../../generated/Land/ERC721";

export function isMint(event: Transfer): boolean {
  return event.params.from.toHexString() == addresses.Null;
}

export function getNFTId(category: string, contractAddress: string, tokenId: string): string {
  return category + "-" + contractAddress + "-" + tokenId;
}

export function getTokenURI(event: Transfer): string {
  let erc721 = ERC721.bind(event.address);
  let tokenURICallResult = erc721.try_tokenURI(event.params.tokenId);

  let tokenURI = "";

  if (tokenURICallResult.reverted) {
    log.warning("tokenURI reverted for tokenID: {} contract: {}", [
      event.params.tokenId.toString(),
      event.address.toHexString(),
    ]);
  } else {
    tokenURI = tokenURICallResult.value;
  }

  return tokenURI;
}

export function updateNFTOrderProperties(nft: NFT, order: Order): NFT {
  if (order.status == orderStatus.OPEN) {
    return addNFTOrderProperties(nft, order);
  } else if (order.status == orderStatus.SOLD || order.status == orderStatus.CANCELLED) {
    return clearNFTOrderProperties(nft);
  } else {
    return nft;
  }
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

export function cancelActiveOrder(nft: NFT | null, now: BigInt): boolean {
  if (nft && nft.activeOrder) {
    let oldOrder = Order.load(nft.activeOrder!);
    if (oldOrder != null && oldOrder.status == orderStatus.OPEN) {
      // Here we are setting old orders as cancelled, because the smart contract allows new orders to be created
      // and they just overwrite them in place. But the subgraph stores all orders ever
      // you can also overwrite ones that are expired
      oldOrder.status = orderStatus.CANCELLED;
      oldOrder.updatedAt = now;
      oldOrder.save();

      return true;
    }
  }
  return false;
}
