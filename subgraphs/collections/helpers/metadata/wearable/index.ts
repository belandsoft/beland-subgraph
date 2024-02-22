import { dataSource, log } from '@graphprotocol/graph-ts'
import { isValidBodyShape } from '..'
import { Collection, Item, NFT, Metadata, Wearable, Emote } from '../../../generated/schema'
import { toLowerCase } from '../../../utils'
import * as categories from './categories'

/**
 * @dev The item's rawMetadata for wearables should follow: version:item_type:name:description:category:bodyshapes
 * If the item has been rescues, the metadata could be be version:item_type:name:description:category:bodyshapes:prev_hash:new_entity_timestamp
 * @param item
 */
export function buildWearableItem(item: Item): Wearable | null {
    let id = item.id
    let data = item.rawMetadata.split(':')
    if ((data.length == 6 || data.length == 8) && isValidWearableCategory(data[4]) && isValidBodyShape(data[5].split(','))) {
        let wearable = Wearable.load(id)

        if (wearable == null) {
            wearable = new Wearable(id)
        }

        wearable.collection = item.collection
        wearable.name = data[2]
        wearable.description = data[3]
        wearable.rarity = item.rarity
        wearable.category = data[4]
        wearable.bodyShapes = data[5].split(',') // Could be more than one
        wearable.save()

        return wearable
    }

    return null
}



function isValidWearableCategory(category: string): boolean {
    if (
        category == 'eyebrows' ||
        category == 'eyes' ||
        category == 'facial_hair' ||
        category == 'hair' ||
        category == 'mouth' ||
        category == 'upper_body' ||
        category == 'lower_body' ||
        category == 'feet' ||
        category == 'earring' ||
        category == 'eyewear' ||
        category == 'hat' ||
        category == 'helmet' ||
        category == 'mask' ||
        category == 'tiara' ||
        category == 'top_head' ||
        category == 'skin' ||
        category == 'hands_wear'
    ) {
        return true
    }

    log.error('Invalid Category {}', [category])

    return false
}

export function setNFTWearableSearchFields(nft: NFT): NFT {
    if (!nft.metadata) {
      return nft
    }
    let metadata = Metadata.load(nft.metadata!)
    if (metadata != null && metadata.wearable != null) {
      let wearable = Wearable.load(metadata.wearable!)
  
      if (wearable) {
        nft.searchText = toLowerCase(wearable.name + ' ' + wearable.description)
        nft.searchItemType = nft.itemType
        nft.searchIsWearableHead = isWearableHead(wearable.category)
        nft.searchIsWearableAccessory = isWearableAccessory(wearable.category)
        nft.searchWearableCategory = wearable.category
        nft.searchWearableBodyShapes = wearable.bodyShapes
        nft.searchWearableRarity = wearable.rarity
      }
    }
  
    return nft
  }
  

export function setItemWearableSearchFields(item: Item): Item {
    if (!item.metadata) {
      return item
    }
    let metadata = Metadata.load(item.metadata!)
    if (metadata != null && metadata.wearable != null) {
      let wearable = Wearable.load(metadata.wearable!)
      if (wearable != null) {
        item.searchText = toLowerCase(wearable.name + ' ' + wearable.description)
        item.searchIsWearableHead = isWearableHead(wearable.category)
        item.searchIsWearableAccessory = isWearableAccessory(wearable.category)
        item.searchWearableCategory = wearable.category
        item.searchWearableBodyShapes = wearable.bodyShapes
        item.searchWearableRarity = wearable.rarity
      }
      item.searchItemType = item.itemType
    }
  
    return item
  }
  


export function isWearableHead(category: string): boolean {
    return (
      category == categories.EYEBROWS ||
      category == categories.EYES ||
      category == categories.FACIAL_HAIR ||
      category == categories.HAIR ||
      category == categories.MOUTH
    )
  }
  
  export function isWearableAccessory(category: string): boolean {
    return (
      category == categories.EARRING ||
      category == categories.EYEWEAR ||
      category == categories.HAT ||
      category == categories.HELMET ||
      category == categories.MASK ||
      category == categories.TIARA ||
      category == categories.TOP_HEAD
    )
  }

  let baseMemetaverseURN = 'urn:memetaverse:'


  export function getURNForCollection(collectionAddress: string): string {
    let network = "nebulas"

    return baseMemetaverseURN + network + ':collections:' + collectionAddress
  }
  

  
  export function getURNForWearable(collectionAddress: string, itemId: string): string {
    return getURNForCollection(collectionAddress) + ':' + itemId
  }
  