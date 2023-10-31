import { CollectionCreated } from "../generated/CollectionFactory/CollectionFactory";
import { Collection as CollectionTemplate } from "../generated/templates";
import { Collection } from "../generated/schema";
import { toLowerCase } from "../utils";

export function handleCreate(event: CollectionCreated): void {
  CollectionTemplate.create(event.params.nft);

  let collectionAddress = event.params.nft.toHexString();
  let collection = new Collection(collectionAddress);
  collection.symbol = event.params.symbol;
  collection.name = event.params.name;
  collection.creator = event.params.creator.toHexString();
  collection.owner = collection.creator;
  collection.isApproved = false;
  collection.isCompleted = false;
  collection.isEditable = true;
  collection.managers = [];
  collection.minters = [];
  collection.urn = `urn:memetaverse:mainnet:collections:${collectionAddress}`;
  collection.itemsCount = 0;
  collection.createdAt = event.block.timestamp; // to support old collections
  collection.updatedAt = event.block.timestamp; // to support old collections
  collection.reviewedAt = event.block.timestamp; // to support old collections
  collection.searchIsStoreMinter = false;
  collection.searchText = toLowerCase(collection.name);
  collection.save();
}
