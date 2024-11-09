import { MetadataUpdate } from "../generated/LandBundle/LandBundle";
import { NFT, Parcel } from "../generated/schema";
import { DataType, buildData } from "./data";
import { getNFTId } from "../utils/nfts";
import * as categories from "../utils/category/categories";
import * as addresses from "../data/addresses";
import { decodeTokenId, getParcelText } from "../utils/parcel";
import { handleTransfer as handleBaseTransfer } from "./nft";
import { Transfer } from "../generated/Land/ERC721";

export function handleTransfer(event: Transfer): void {
  handleBaseTransfer(event);
}

export function handleUpdate(event: MetadataUpdate): void {
  let parcelId = event.params.tokenId.toString();
  let data = event.params.data.toString();
  let id = getNFTId(categories.PARCEL, addresses.Land, parcelId);
  let parcel = new Parcel(id);
  parcel.rawData = data;

  let parcelData = buildData(id, data, DataType.PARCEL);
  if (parcelData != null) {
    parcel.data = id;
    parcelData.save();

    let coordinates = decodeTokenId(event.params.tokenId);
    parcel.x = coordinates[0];
    parcel.y = coordinates[1];

    let nft = new NFT(id);
    nft.name = parcelData.name;
    nft.searchText = getParcelText(parcel, parcelData.name!);
    nft.updatedAt = event.block.timestamp;
    nft.save();
  }

  parcel.save();
}
