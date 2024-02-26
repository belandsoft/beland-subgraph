import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Rarity } from "../../generated/schema";

export function getRarityAddress(): Address {
  return Address.fromString("0x523cac2fa0b2c71531e8bcb87f6a31d0479213a0");
}

export function handleAddRarity(name: string, price: BigInt, maxSupply: BigInt, currency: string): void {
  let rarity = Rarity.load(name);

  if (rarity === null) {
    rarity = new Rarity(name);
  } else if (rarity.currency != currency) {
    log.info("Ignoring because it was not added with the current Rarity Contract", []);
    return;
  }

  rarity.name = name;
  rarity.price = price;
  rarity.maxSupply = maxSupply;
  rarity.currency = currency;
  rarity.save();
}

export function handleUpdatePrice(name: string, price: BigInt, currency: string): void {
  let rarity = Rarity.load(name);

  if (rarity === null) {
    log.error("Rarity with name {} not found", [name]);
    return;
  }

  if (rarity.currency != currency) {
    log.info("Ignoring because it was not added with the current Rarity Contract", []);
    return;
  }

  rarity.price = price;
  rarity.currency = currency;
  rarity.save();
}
