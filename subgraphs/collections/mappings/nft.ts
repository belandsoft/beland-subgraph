import { Issue, Transfer } from "../generated/CollectionFactory/Collection";
import { Collection, Item, Mint, NFT } from "../generated/schema";
import { getNFTId } from "../helpers/nft";
import * as itemTypes from "../helpers/metadata/itemTypes";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { setNFTSearchFields } from "../helpers/metadata";
import { createOrLoadAccount } from "../helpers/account";
import { buildCountFromNFT } from "../helpers/count";
import { getSaleAddress } from "../helpers/sale";
import { CollectionSale } from "../generated/templates";

/**
 * @notice mint an NFT by a collection v2 issue event
 * @param event
 * @param collectionAddress
 * @param item
 */
export function handleMintNFT(event: Issue, collectionAddress: string, item: Item): void {
  let nftId = getNFTId(collectionAddress, event.params._tokenId.toString());
  let nft = new NFT(nftId);
  let issuedId = event.params._issuedId;
  
  let collection = Collection.load(collectionAddress);
  if (!collection) {
    return;
  }
  nft.collection = collection.id;
  nft.category = item.itemType == itemTypes.EMOTE_V1 ? "emote" : "wearable";
  nft.tokenId = event.params._tokenId;
  nft.contractAddress = collectionAddress;
  nft.itemBlockchainId = event.params._itemId;
  nft.itemType = item.itemType;
  nft.issuedId = event.params._issuedId;
  nft.collection = collectionAddress;
  nft.item = item.id;
  nft.urn = item.urn;
  nft.owner = event.params._beneficiary.toHexString();
  nft.tokenURI = item.URI + "/" + issuedId.toString();
  nft.image = item.image;
  nft.metadata = item.metadata;
  nft.txHash = event.transaction.hash;

  nft.createdAt = event.block.timestamp;
  nft.updatedAt = event.block.timestamp;
  nft.soldAt = null;
  nft.transferredAt = event.block.timestamp;

  nft.sales = 0;
  nft.volume = BigInt.fromI32(0);

  nft = setNFTSearchFields(nft);

  createOrLoadAccount(event.params._beneficiary);

  let metric = buildCountFromNFT();
  metric.save();

  nft.save();

  // store mint data
  let minterAddress = event.params._caller.toHexString();
  let isStoreMinter = minterAddress == getSaleAddress();
  let mint = new Mint(nftId);
  mint.nft = nft.id;
  mint.item = item.id;
  mint.beneficiary = nft.owner;
  mint.creator = item.creator;
  mint.minter = minterAddress;
  mint.timestamp = event.block.timestamp;
  mint.searchContractAddress = nft.contractAddress;
  mint.searchTokenId = nft.tokenId;
  mint.searchItemId = item.blockchainId;
  mint.searchIssuedId = issuedId;
  mint.searchIsStoreMinter = isStoreMinter;

  // count primary sale
  if (isStoreMinter) {
    mint.searchPrimarySalePrice = item.price;
  }

  mint.save();
}

export function handleTransferNFT(event: Transfer): void {
  if (event.params.tokenId.toString() == "") {
    return;
  }

  let collectionAddress = event.address.toHexString();
  let id = getNFTId(collectionAddress, event.params.tokenId.toString());

  let nft = NFT.load(id);
  if (!nft) {
    return;
  }

  nft.owner = event.params.to.toHex();
  nft.updatedAt = event.block.timestamp;
  nft.transferredAt = event.block.timestamp;

  createOrLoadAccount(event.params.to);

  nft.save();
}
