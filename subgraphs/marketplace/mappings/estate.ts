import { BigInt } from "@graphprotocol/graph-ts";
import { BundleNew, BundleAdd, BundleRemove, MetadataUpdate } from "../generated/EstateRegistry/EstateRegistry";
import { Estate, NFT, Parcel } from "../generated/schema";
import { DataType, buildData } from "../modules/data";
import * as addresses from "../data/addresses";
import * as categories from "../modules/category/categories";
import { getNFTId } from "../modules/nft";
import { toLowerCase } from "../modules/utils/index";

export function handleCreateBundle(event: BundleNew): void {
  let estateId = event.params.tokenId.toString();
  let data = event.params.data.toString();
  let landIds = event.params.tokenIds;
  let id = getNFTId(categories.ESTATE, addresses.getEstateRegistry(), estateId);

  let estate = new Estate(id);

  estate.tokenId = event.params.tokenId;
  estate.rawData = data;
  estate.parcelDistances = [];
  estate.size = landIds.length;
  estate.adjacentToRoadCount = 0;

  let estateNFT = new NFT(id);
  estateNFT.searchEstateSize = estate.size;
  estateNFT.createdAt = event.block.timestamp;
  estateNFT.updatedAt = event.block.timestamp;
  estateNFT.searchDistanceToPlaza = -1;
  estateNFT.searchAdjacentToRoad = false;
  estateNFT.soldAt = null;
  estateNFT.sales = 0;
  estateNFT.volume = BigInt.fromI32(0);

  let estateData = buildData(id, data, DataType.ESTATE);
  if (estateData != null) {
    estate.data = id;
    estateData.save();

    estateNFT.name = estateData.name;
    estateNFT.searchText = toLowerCase(estateData.name!);
  }
  estate.save();
  estateNFT.save();

  for (let i = 0; i < landIds.length; i++) {
    let parcelId = getNFTId(categories.PARCEL, addresses.getLANDRegistry(), landIds[i].toString());
    let parcel = Parcel.load(parcelId);
    if (parcel) {
      parcel.estate = estate.id;

      let parcelNFT = new NFT(parcelId);
      parcelNFT.searchParcelEstateId = id;
      parcelNFT.save();
      if (estateNFT != null && estate != null) {
        estate.parcelDistances = [];

        let adjacentToRoad = -1;
        if (adjacentToRoad) {
          estate.adjacentToRoadCount += 1;
        }

        estate.save();

        let distances = estate.parcelDistances!;
        estateNFT.searchDistanceToPlaza = distances.length ? distances[0] : -1;
        //estateNFT.searchAdjacentToRoad = estateNFT.searchAdjacentToRoad || adjacentToRoad;
        estateNFT.save();
      }

      parcel.save();
    }
  }
}

export function handleBundleAddItems(event: BundleAdd): void {
  let estateId = event.params.tokenId.toString();
  let landIds = event.params.tokenIds;
  let id = getNFTId(categories.ESTATE, addresses.getEstateRegistry(), estateId);
  let estate = Estate.load(id);
  if (!estate) return;

  estate.size += landIds.length;

  let estateNFT = NFT.load(id);
  if (!estateNFT) return;

  estateNFT.searchEstateSize = estate.size;
  estateNFT.save();

  for (let i = 0; i < landIds.length; i++) {
    let parcelId = getNFTId(categories.PARCEL, addresses.getLANDRegistry(), landIds[i].toString());
    let parcel = Parcel.load(parcelId);
    if (parcel) {
      parcel.estate = estate.id;

      let parcelNFT = new NFT(parcelId);
      parcelNFT.searchParcelEstateId = id;
      parcelNFT.save();
      if (estateNFT != null && estate != null) {
        estate.parcelDistances = [];

        let adjacentToRoad = -1;
        if (adjacentToRoad) {
          estate.adjacentToRoadCount += 1;
        }

        estate.save();

        let distances = estate.parcelDistances!;
        estateNFT.searchDistanceToPlaza = distances.length ? distances[0] : -1;
        // estateNFT.searchAdjacentToRoad = estateNFT.searchAdjacentToRoad || adjacentToRoad;
        estateNFT.save();
      }

      parcel.save();
    }
  }
}

export function handleBundleRemoveItems(event: BundleRemove): void {
  let estateId = event.params.tokenIds.toString();
  let landIds = event.params.tokenIds;

  let id = getNFTId(categories.ESTATE, addresses.getEstateRegistry(), estateId);
  let estate = Estate.load(id);
  if (!estate) return;

  estate.size -= landIds.length;
  estate.save();

  let estateNFT = NFT.load(id);
  if (!estateNFT) return;
  estateNFT.searchEstateSize = estate.size;
  estateNFT.save();

  for (let i = 0; i < landIds.length; i++) {
    let parcelId = getNFTId(categories.PARCEL, addresses.getLANDRegistry(), landIds[i].toString());
    let parcel = Parcel.load(parcelId);
    if (parcel) {
      parcel.estate = null;
      parcel.save();

      let parcelNFT = new NFT(parcelId);
      parcelNFT.searchParcelEstateId = null;
      parcelNFT.save();

      if (estateNFT != null && estate != null) {
        estate.save();
        estateNFT.save();
      }
    }
  }
}

export function handleUpdate(event: MetadataUpdate): void {
  let estateId = event.params.tokenId.toString();
  let data = event.params.data.toString();
  let id = getNFTId(categories.ESTATE, addresses.getEstateRegistry(), estateId);

  let estate = new Estate(id);
  estate.rawData = data;

  let estateData = buildData(id, data, DataType.ESTATE);
  if (estateData != null) {
    estate.data = id;
    estateData.save();

    let nft = new NFT(id);
    nft.name = estateData.name;
    nft.searchText = toLowerCase(estateData.name!);
    nft.updatedAt = event.block.timestamp;
    nft.save();
  }

  estate.save();
}
