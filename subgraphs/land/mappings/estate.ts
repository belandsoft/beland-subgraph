import { ethereum } from "@graphprotocol/graph-ts";
import { Transfer, BundleNew, BundleAdd, BundleRemove, MetadataUpdate } from "../generated/LandBundle/LandBundle";
import { Estate, Parcel } from "../generated/schema";
import { buildData } from "./data";

export function handleTransfer(event: Transfer): void {
  let estate = Estate.load(event.params.tokenId.toString());
  if (!estate) {
    estate = new Estate(event.params.tokenId.toString());
    estate.parcels = [];
    estate.size = 0;
    estate.createdAt = event.block.timestamp;
  }
  estate.owner = event.params.to;
  estate.updatedAt = event.block.timestamp;
  estate.save();
}

export function handleCreateBundle(event: BundleNew): void {
  let estate = Estate.load(event.params.tokenId.toString());
  let tokenIds = event.params.tokenIds;

  for (let i = 0; i < tokenIds.length; i++) {
    let parcel = Parcel.load(tokenIds[i].toString());
    parcel.estate = estate.id;
    parcel.save();
  }
  estate.parcels = tokenIds.map<string>((tokenId) => tokenId.toString());
  estate.size = estate.parcels.length;
  buildMetadata(estate, event.params.data.toString(), event);
  estate.save();
}

export function handleBundleAddItems(event: BundleAdd): void {
  let estate = Estate.load(event.params.tokenId.toString());
  let tokenIds = event.params.tokenIds;
  for (let i = 0; i < tokenIds.length; i++) {
    let parcel = Parcel.load(tokenIds[i].toString());
    parcel.estate = estate.id;
    parcel.save();
  }
  estate.parcels = estate.parcels.concat(tokenIds.map<string>((tokenId) => tokenId.toString()));
  estate.size = estate.parcels.length;
  estate.save();
}

export function handleBundleRemoveItems(event: BundleRemove): void {
  let estate = Estate.load(event.params.tokenId.toString());
  let tokenIds = event.params.tokenIds;
  for (let i = 0; i < tokenIds.length; i++) {
    let parcelId = tokenIds.toString();
    let parcel = Parcel.load(parcelId);
    parcel.estate = null;
    parcel.save();
    estate.parcels.splice(estate.parcels.indexOf(parcelId), 1);
  }
  estate.size = estate.parcels.length;
  estate.save();
}

export function handleUpdateMetadata(event: MetadataUpdate): void {
  let estate = Estate.load(event.params.tokenId.toString());
  let data = event.params.data.toString();
  buildMetadata(estate, data, event);
  estate.save();
}

function buildMetadata(estate: Estate | null, data: string, event: ethereum.Event): void{
  estate.rawData = data;
  let estateData = buildData(data);
  if (estateData != null) {
    estate.name = estateData.name;
    estate.description = estateData.description;
    estate.version = estateData.version;
    estate.ipns = estateData.ipns;
  }
  estate.updatedAt = event.block.timestamp;
}
