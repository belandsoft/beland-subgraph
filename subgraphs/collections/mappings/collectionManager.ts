import { RaritiesSet } from "../generated/CollectionManager/CollectionManager";
import { getRarityAddress } from "../helpers/rarity";
import { Rarity as RarityContract } from "../generated/CollectionManager/Rarity";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { Rarity } from "../generated/schema";

export function handleRaritiesSet(event: RaritiesSet): void {
  let rarityAddress = getRarityAddress();
  let newRaritiesAddress = event.params._newRarities;

  if (newRaritiesAddress == rarityAddress) {
    let rarityContract = RarityContract.bind(rarityAddress);
    let raritiesCount = rarityContract.raritiesCount().toI32();

    for (let i = 0; i < raritiesCount; i++) {
      let blockchainRarity = rarityContract.rarities(BigInt.fromI32(i));
      let name = blockchainRarity.getName();
      let rarity = Rarity.load(name);

      if (rarity === null) {
        rarity = new Rarity(name);
      }

      rarity.name = blockchainRarity.getName();
      rarity.price = blockchainRarity.getPrice();
      rarity.maxSupply = blockchainRarity.getMaxSupply();
      rarity.currency = "MTV";
      rarity.save();
    }
  } else {
    log.error("Unsupported rarity contract address {}", [newRaritiesAddress.toHexString()]);
  }
}
