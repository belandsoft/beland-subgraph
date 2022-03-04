import { Transfer, BundleNew, BundleAdd, BundleRemove, MetadataUpdate } from "../generated/LandBundle/LandBundle";
import { Data, Estate, Parcel } from "../generated/schema";
import { buildData, DataType } from "./data";

export function handleTransfer(event: Transfer): void {
  let estate = Estate.load(event.params.tokenId.toString());
  if (!estate) {
    estate = new Estate(event.params.tokenId.toString());
    estate.parcels = [];
  }
  estate.owner = event.params.to;
  estate.save();
}

export function handleCreateBundle(event: BundleNew): void {
  let estate = Estate.load(event.params.tokenId.toString());
  for (let i = 0; i < event.params.tokenIds.length; i++) {
    let parcel = Parcel.load(event.params.tokenIds[i].toString());
    parcel.estate = estate.id;
    parcel.save();
    estate.parcels.push(parcel.id);
  }
  estate.save();
}

export function handleBundleAddItems(event: BundleAdd): void {
  let estate = Estate.load(event.params.tokenId.toString());
  for (let i = 0; i < event.params.tokenIds.length; i++) {
    let parcel = Parcel.load(event.params.tokenIds[i].toString());
    parcel.estate = estate.id;
    parcel.save();
    estate.parcels.push(parcel.id);
  }
  estate.save();
}

export function handleBundleRemoveItems(event: BundleRemove): void {
  let estate = Estate.load(event.params.tokenId.toString());
  for (let i = 0; i < event.params.tokenIds.length; i++) {
    var parcelId = event.params.tokenIds[i].toString();
    let parcel = Parcel.load(parcelId);
    parcel.estate = null;
    parcel.save();
    estate.parcels.splice(estate.parcels.indexOf(parcelId), 1);
  }
  estate.save();
}

export function handleUpdateMetadata(event: MetadataUpdate) {
  let estate = Estate.load(event.params.tokenId.toString());
  let data = event.params.data.toString();
  estate.rawData = data;
  let estateDataId = DataType.ESTATE + "-" + estate.id;
  let estateData = buildData(estateDataId, data, DataType.ESTATE);
  if (estateData != null) {
    estate.data = estateDataId;
    estateData.save();
  }
  estate.save();
}
