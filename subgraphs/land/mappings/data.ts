import { parseCSV } from "@graphprotocol/graph-ts/helper-functions";

export enum DataType {
  PARCEL = 0,
  ESTATE = 1,
}

export class DataEntry {
  name: string;
  description: string;
  ipns: string;
  version: string;
}

export function buildData(csv: string): DataEntry | null {
  const dataEntity: DataEntry = {
    name: "",
    description: "",
    ipns: "",
    version: "",
  };

  if (csv.charAt(0) != "0") {
    return null;
  }

  const data = parseCSV(csv);
  if (data.length === 0 || data[0] != "0") {
    return null;
  }

  dataEntity.version = data[0];

  if (data.length > 1) {
    dataEntity.name = data[1];
  }
  if (data.length > 2) {
    dataEntity.description = data[2];
  }
  if (data.length > 3) {
    dataEntity.ipns = data[3];
  }

  return dataEntity;
}
