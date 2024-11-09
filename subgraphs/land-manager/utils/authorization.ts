import { ethereum, Entity, Value, BigInt, store, Address } from "@graphprotocol/graph-ts";
import * as NFTType from "../utils/nft";
import { Authorization } from "../generated/schema";

export function createAuthorizationId(event: ethereum.Event, type: string): string {
  return event.block.number.toString() + "-" + event.logIndex.toString() + "-" + type;
}

export function buildAuthorization(event: ethereum.Event, type: string): Authorization {
  let id = createAuthorizationId(event, type);
  let authorization = new Authorization(id);

  authorization.type = type;
  authorization.tokenAddress = event.address;
  authorization.timestamp = buildTimestamp(event);
  authorization.createdAt = event.block.timestamp;

  return authorization;
}

export function createOwnership(
  authorizationType: string,
  nftType: string,
  eventName: string,
  event: ethereum.Event,
  address: Address | null,
  id: BigInt
): void {
  let authorizationId = createAuthorizationId(event, authorizationType);
  let entity: Entity = new Entity();

  entity.set("id", Value.fromString(authorizationId));

  if (address === null) {
    entity.unset("address");
  } else {
    entity.set("address", Value.fromAddress(address));
  }

  entity.set("eventName", Value.fromString(eventName));
  entity.set("timestamp", Value.fromBigInt(buildTimestamp(event)));
  entity.set("createdAt", Value.fromBigInt(event.block.timestamp));

  setNFT(nftType, entity, id);

  store.set(authorizationType, authorizationId.toString(), entity);
}

function setNFT(nftType: string, entity: Entity, id: BigInt): void {
  if (nftType == NFTType.PARCEL) {
    entity.set("parcel", Value.fromString(id.toString()));
  } else if (nftType == NFTType.ESTATE) {
    entity.set("estate", Value.fromString(id.toString()));
  }
}

function buildTimestamp(event: ethereum.Event): BigInt {
  return event.block.timestamp.times(BigInt.fromI32(1000000)).plus(event.logIndex);
}
