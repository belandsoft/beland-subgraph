import { Parcel } from "../generated/schema";
import { Approval, ApprovalForAll, MetadataUpdate, SetOperator, Transfer } from "../generated/Land/Land";
import { decodeTokenId } from "../utils/parcel";
import { buildAuthorization, createOwnership } from "../utils/authorization";
import { createWallet } from "../utils/wallet";
import { DataType, buildData } from "../utils/data";
import * as AuthorizationType from '../utils/authorization-types'
import * as NFTType from "../utils/nft";
import * as EventType from "../utils/event-types";


export function handleTransfer(event: Transfer): void {
  let coordinates = decodeTokenId(event.params.tokenId);
  let id = event.params.tokenId.toString();
  let parcel = new Parcel(id);
  parcel.x = coordinates[0];
  parcel.y = coordinates[1];
  parcel.tokenId = event.params.tokenId;
  parcel.owner = event.params.to.toHex();
  parcel.operator = null;
  parcel.updateOperator = null;
  parcel.updatedAt = event.block.timestamp;
  parcel.save();
  createOwnership(
    AuthorizationType.OWNER,
    NFTType.PARCEL,
    EventType.TRANSFER,
    event,
    event.params.to,
    event.params.tokenId
  );
  createOwnership(AuthorizationType.OPERATOR, NFTType.PARCEL, EventType.TRANSFER, event, null, event.params.tokenId);
  createOwnership(
    AuthorizationType.UPDATE_OPERATOR,
    NFTType.PARCEL,
    EventType.TRANSFER,
    event,
    null,
    event.params.tokenId
  );
  createWallet(event.params.to);
}

export function handleApproval(event: Approval): void {
  let id = event.params.tokenId.toString();
  let coordinates = decodeTokenId(event.params.tokenId);
  let parcel = new Parcel(id);
  parcel.x = coordinates[0];
  parcel.y = coordinates[1];
  parcel.tokenId = event.params.tokenId;
  parcel.owner = event.params.owner.toHex();
  parcel.operator = event.params.approved;
  parcel.updatedAt = event.block.timestamp;
  parcel.save();
  createOwnership(
    AuthorizationType.OPERATOR,
    NFTType.PARCEL,
    EventType.APPROVAL,
    event,
    event.params.owner,
    event.params.tokenId
  );
}

export function handleApprovalForAll(event: ApprovalForAll): void {
  let authorization = buildAuthorization(event, AuthorizationType.OPERATOR);
  authorization.owner = event.params.owner.toHex();
  authorization.operator = event.params.operator;
  authorization.isApproved = event.params.approved;
  authorization.save();
  createWallet(event.params.owner);
}

export function handleUpdate(event: MetadataUpdate): void {
  let id = event.params.landId.toString();
  let data = event.params.data.toString();
  let parcel = new Parcel(id);
  let parcelData = buildData(id, data, DataType.PARCEL);
  if (parcelData != null) {
    parcel.data = id;
    parcelData.save();
  }
  parcel.save();
}

export function handleSetOperator(event: SetOperator): void {
  let id = event.params.tokenId.toString();
  let coordinates = decodeTokenId(event.params.tokenId);
  let parcel = new Parcel(id);
  parcel.x = coordinates[0];
  parcel.y = coordinates[1];
  parcel.tokenId = event.params.tokenId;
  parcel.updateOperator = event.params.operator;
  parcel.updatedAt = event.block.timestamp;
  parcel.save();
  createOwnership(
    AuthorizationType.UPDATE_OPERATOR,
    NFTType.PARCEL,
    EventType.UPDATE_OPERATOR,
    event,
    event.params.operator,
    event.params.tokenId
  );
}


export function demo() : number {
  return 1;
}