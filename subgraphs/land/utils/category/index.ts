import * as addresses from "../../data/addresses";
import { ESTATE, PARCEL, WEARABLE } from "./categories";

export function getCategory(contractAddress: string): string {
  if (contractAddress == addresses.Land) {
    return PARCEL;
  } else if (contractAddress == addresses.Estate) {
    return ESTATE;
  } else {
    return WEARABLE;
  }
}
