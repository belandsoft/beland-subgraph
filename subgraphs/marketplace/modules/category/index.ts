import { log } from "@graphprotocol/graph-ts";
import * as categories from "./categories";
import * as addresses from "../../data/addresses";

export function getCategory(contractAddress: string): string {
  let category = "";

  if (contractAddress == addresses.getLANDRegistry()) {
    category = categories.PARCEL;
  } else if (contractAddress == addresses.getEstateRegistry()) {
    category = categories.ESTATE;
  } else {
    log.warning("Contract address {} not being monitored", [contractAddress]);
    category = contractAddress;
  }

  return category;
}
