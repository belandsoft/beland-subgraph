import { Estate, Parcel } from "../generated/schema";
import {
  Approval,
  ApprovalForAll,
  BundleAdd,
  BundleNew,
  BundleRemove,
  MetadataUpdate,
  SetOperator,
  Transfer,
} from "../generated/LandBundle/LandBundle";
import { DataType, buildData } from "../utils/data";
import { createWallet } from "../utils/wallet";
import { AuthorizationType, buildAuthorization, createOwnership } from "../utils/authorization";
import { NFTType } from "../utils/nft";
import { EventType } from "../utils/event";

export function handleTransfer(event: Transfer): void {
  let id = event.params.tokenId.toString();
  let estate = new Estate(id);
  estate.owner = event.params.to.toHex();
  estate.operator = null;
  estate.updateOperator = null;
  estate.updatedAt = event.block.timestamp;
  estate.save();
  createOwnership(
    AuthorizationType.OWNER,
    NFTType.ESTATE,
    EventType.TRANSFER,
    event,
    event.params.to,
    event.params.tokenId
  );
  createOwnership(AuthorizationType.OPERATOR, NFTType.ESTATE, EventType.TRANSFER, event, null, event.params.tokenId);
  createOwnership(
    AuthorizationType.UPDATE_OPERATOR,
    NFTType.ESTATE,
    EventType.TRANSFER,
    event,
    null,
    event.params.tokenId
  );
  createWallet(event.params.to);
}

export function handleApproval(event: Approval): void {
  let id = event.params.tokenId.toString();
  let estate = new Estate(id);
  estate.owner = event.params.owner.toHex();
  estate.operator = event.params.approved;
  estate.updatedAt = event.block.timestamp;
  estate.save();
  createOwnership(
    AuthorizationType.OPERATOR,
    NFTType.ESTATE,
    EventType.APPROVAL,
    event,
    event.params.approved,
    event.params.tokenId
  );
}

export function handleUpdate(event: MetadataUpdate): void {
  let id = event.params.tokenId.toString();
  let data = event.params.data.toString();
  let estate = new Estate(id);
  let estateData = buildData(id, data, DataType.ESTATE);
  if (estateData != null) {
    estate.data = id;
    estateData.save();
  }
  estate.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let authorization = buildAuthorization(event, AuthorizationType.OPERATOR);
  authorization.owner = event.params.owner.toHex();
  authorization.operator = event.params.operator;
  authorization.isApproved = event.params.approved;
  authorization.save();
  createWallet(event.params.owner);
}

export function handleSetOperator(event: SetOperator): void {
  let id = event.params.tokenId.toString();
  let estate = new Estate(id);
  estate.owner = event.params.operator.toHex();
  estate.updateOperator = event.params.operator;
  estate.updatedAt = event.block.timestamp;
  estate.save();
  createOwnership(
    AuthorizationType.UPDATE_OPERATOR,
    NFTType.ESTATE,
    EventType.UPDATE_OPERATOR,
    event,
    event.params.operator,
    event.params.tokenId
  );
}

export function handleCreateBundle(event: BundleNew): void {
  let id = event.params.tokenId.toString();
  let data = event.params.data.toString();
  let landIds = event.params.tokenIds;

  let estate = new Estate(id);

  estate.size = landIds.length;
  estate.createdAt = event.block.timestamp;

  let estateData = buildData(id, data, DataType.ESTATE);
  if (estateData != null) {
    estate.data = id;
    estateData.save();
  }

  for (let i = 0; i < landIds.length; i++) {
    let parcel = new Parcel(landIds[i].toString());
    parcel.estate = id;
    parcel.save();
  }

  estate.save();
}

export function handleBundleAddItems(event: BundleAdd): void {
  let id = event.params.tokenId.toString();
  let landIds = event.params.tokenIds;
  let estate = new Estate(id);

  for (let i = 0; i < landIds.length; i++) {
    let parcel = new Parcel(landIds[i].toString());
    parcel.estate = id;
    parcel.save();
  }
  estate.size += landIds.length;
  estate.save();
}

export function handleBundleRemoveItems(event: BundleRemove): void {
  let id = event.params.tokenId.toString();
  let landIds = event.params.tokenIds;
  let estate = new Estate(id);

  for (let i = 0; i < landIds.length; i++) {
    let parcel = new Parcel(landIds[i].toString());
    parcel.estate = null;
    parcel.save();
  }
  estate.size -= landIds.length;
  estate.save();
}
