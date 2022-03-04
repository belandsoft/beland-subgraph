import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Land/Land";
import { MetadataUpdate } from "../generated/LandBundle/LandBundle";
import { Parcel } from "../generated/schema";
import { buildData, DataType } from "./data";

const WIDTH = BigInt.fromI32(300);
const HEIGHT = BigInt.fromI32(300);

export function handleTransfer(event: Transfer): void {
  let parcel = Parcel.load(event.params.tokenId.toString());
  if (!parcel) {
    parcel = new Parcel(event.params.tokenId.toString());
    parcel.x = event.params.tokenId.div(WIDTH);
    parcel.y = event.params.tokenId.mod(HEIGHT);
  }
  parcel.owner = event.params.to;
  parcel.save();
}

export function handleUpdateMetadata(event: MetadataUpdate) {
  let parcel = Parcel.load(event.params.tokenId.toString());
  let data = event.params.data.toString();
  parcel.rawData = data;
  let parcelDataId = DataType.PARCEL + "-" + parcel.id;
  let parcelData = buildData(parcelDataId, data, DataType.PARCEL);
  if (parcelData != null) {
    parcel.data = parcelDataId;
    parcelData.save();
  }
  parcel.save();
}
