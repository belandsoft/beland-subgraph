import { AddRarity, UpdatePrice } from '../generated/Rarity/Rarity'
import * as utils from '../helpers/rarity'

let CURRENCY = 'MTV'

export function handleAddRarity(event: AddRarity): void {
  utils.handleAddRarity(event.params._rarity.name, event.params._rarity.price, event.params._rarity.maxSupply, CURRENCY)
}

export function handleUpdatePrice(event: UpdatePrice): void {
  utils.handleUpdatePrice(event.params._name, event.params._price, CURRENCY)
}