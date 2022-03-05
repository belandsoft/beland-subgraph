import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Land/Land";
import { MetadataUpdate } from "../generated/LandBundle/LandBundle";
import { Parcel } from "../generated/schema";
import { buildData, DataType } from "./data";

let WIDTH = BigInt.fromI32(300);
let HEIGHT = BigInt.fromI32(300);

export function handleTransfer(event: Transfer): void {
  let parcel = Parcel.load(event.params.tokenId.toString());
  if (!parcel) {
    parcel = new Parcel(event.params.tokenId.toString());
    parcel.x = event.params.tokenId.mod(WIDTH);
    parcel.y = event.params.tokenId.div(HEIGHT);
    parcel.createdAt = event.block.timestamp;
  }
  parcel.updatedAt = event.block.timestamp;
  parcel.owner = event.params.to;
  parcel.save();
}

export function handleUpdateMetadata(event: MetadataUpdate): void {
  let parcel = Parcel.load(event.params.tokenId.toString());
  let data = event.params.data.toString();
  parcel.rawData = data;
  let parcelData = buildData(data);
  if (parcelData != null) {
    parcel.name = parcelData.name;
    parcel.description = parcelData.description;
    parcel.ipns = parcelData.ipns;
    parcel.version = parcelData.version;
  }
  parcel.updatedAt = event.block.timestamp;
  parcel.save();
}
