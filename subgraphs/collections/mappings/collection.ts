import { Collection as CollectionTemplate } from '../generated/templates'
import { Collection as CollectionContract } from '../generated/templates/Collection/Collection'

import { Collection, Item, Rarity } from '../generated/schema'
import { OwnershipTransferred, ProxyCreated } from '../generated/CollectionFactory/CollectionFactory'
import { toLowerCase } from '../utils'
import { buildCountFromCollection, buildCountFromItem } from '../helpers/count'
import { createOrLoadAccount } from '../helpers/account'
import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { AddItem, Complete, CreatorshipTransferred, Issue, RescueItem, SetApproved, SetEditable, SetGlobalManager, SetGlobalMinter, SetItemManager, SetItemMinter, Transfer, UpdateItemData } from '../generated/CollectionFactory/Collection'
import { getItemId, getItemImage, removeItemMinter } from '../helpers/item'
import { buildItemMetadata, setItemSearchFields } from '../helpers/metadata'
import { handleMintNFT, handleTransferNFT } from './nft'
import { getSaleAddress } from '../helpers/sale'
import { getURNForCollection, getURNForWearable } from '../helpers/metadata/wearable'
import { isMint } from '../helpers/nft'


export function handleCollectionCreation(event: ProxyCreated): void {
  // Initialize template
  CollectionTemplate.create(event.params._address)

  // Bind contract
  let collectionContract = CollectionContract.bind(event.params._address)

  let collectionAddress = event.params._address.toHexString()
  let collection = new Collection(collectionAddress)

  let isApproved = collectionContract.isApproved()
  // Set base collection data
  collection.name = collectionContract.name()
  collection.symbol = collectionContract.symbol()
  collection.owner = collectionContract.owner().toHexString()
  collection.creator = collectionContract.creator().toHexString()
  collection.isCompleted = collectionContract.isCompleted()
  collection.isApproved = isApproved
  collection.isEditable = collectionContract.isEditable()
  collection.minters = []
  collection.managers = []
  collection.urn = getURNForCollection(collectionAddress)
  collection.itemsCount = 0
  collection.createdAt = event.block.timestamp // to support old collections
  collection.updatedAt = event.block.timestamp // to support old collections
  collection.reviewedAt = event.block.timestamp // to support old collections
  collection.searchIsStoreMinter = false
  collection.searchText = toLowerCase(collection.name)
  collection.save()

  let metric = buildCountFromCollection()
  metric.save()

  let creatorAccount = createOrLoadAccount(Address.fromString(collection.creator))
  creatorAccount.collections += 1
  creatorAccount.save()
}

export function handleAddItem(event: AddItem): void {
  let collectionAddress = event.address.toHexString()
  let collection = Collection.load(collectionAddress)

  if (collection == null) {
    // Skip it, collection will be set up once the proxy event is created
    // The ProxyCreated event is emitted right after the collection's event
    return
  }

  // Count item
  collection.itemsCount += 1
  collection.save()

  // Bind contract
  let collectionContract = CollectionContract.bind(event.address)

  let contractItem = event.params._item
  let itemId = event.params._itemId.toString()

  let id = getItemId(collectionAddress, itemId.toString())
  let rarity = Rarity.load(contractItem.rarity)
  let creationFee = BigInt.fromI32(0)

  if (!rarity) {
    log.warning('Undefined rarity {} for collection {} and item {}', [contractItem.rarity, collectionAddress, itemId.toString()])
  } else {
    creationFee = rarity.price
  }

  let item = new Item(id)
  item.creator = collection.creator
  item.blockchainId = event.params._itemId
  item.collection = collectionAddress
  item.creationFee = creationFee
  item.rarity = contractItem.rarity
  item.available = contractItem.maxSupply
  item.totalSupply = contractItem.totalSupply
  item.maxSupply = contractItem.maxSupply
  item.price = contractItem.price
  item.beneficiary = contractItem.beneficiary.toHexString()
  item.contentHash = contractItem.contentHash
  item.rawMetadata = contractItem.metadata
  item.searchIsCollectionApproved = collectionContract.isApproved()
  item.URI = collectionContract.baseURI() + '2484/' + collectionAddress + '/' + itemId
  item.urn = getURNForWearable(collectionAddress, itemId.toString())
  item.image = getItemImage(item)
  item.minters = []
  item.managers = []
  item.searchIsStoreMinter = false
  item.createdAt = event.block.timestamp
  item.updatedAt = event.block.timestamp
  item.reviewedAt = event.block.timestamp
  item.soldAt = null
  item.sales = 0
  item.volume = BigInt.fromI32(0)
  item.uniqueCollectors = []
  item.uniqueCollectorsTotal = 0

  let metadata = buildItemMetadata(item)

  item.metadata = metadata.id
  item.itemType = metadata.itemType

  item = setItemSearchFields(item)
  item.save()

  let count = buildCountFromItem()
  count.daoEarningsManaTotal = count.daoEarningsManaTotal.plus(creationFee)
  count.save()
}

export function handleRescueItem(event: RescueItem): void {
  let collectionAddress = event.address.toHexString()
  let itemId = event.params._itemId.toString()

  let id = getItemId(collectionAddress, itemId)

  let item = Item.load(id)
  if (item != null) {

    item.rawMetadata = event.params._metadata
    item.contentHash = event.params._contentHash

    let metadata = buildItemMetadata(item)

    item.metadata = metadata.id
    item.itemType = metadata.itemType

    item = setItemSearchFields(item)

    item.updatedAt = event.block.timestamp

    item.save()
  }

  let collection = Collection.load(collectionAddress)

  if (collection != null) {
    collection.updatedAt = event.block.timestamp
    collection.reviewedAt = event.block.timestamp
    collection.save()
  }
}

export function handleUpdateItemData(event: UpdateItemData): void {
  let collectionAddress = event.address.toHexString()
  let itemId = event.params._itemId.toString()
  let id = getItemId(collectionAddress, itemId)

  let item = Item.load(id)
  if (item != null) {
    item.price = event.params._price
    item.beneficiary = event.params._beneficiary.toHexString()
    item.rawMetadata = event.params._metadata

    let metadata = buildItemMetadata(item)

    item.metadata = metadata.id
    item.itemType = metadata.itemType
    item = setItemSearchFields(item)

    item.updatedAt = event.block.timestamp
    item.save()
  }
}

export function handleIssue(event: Issue): void {
  let collectionAddress = event.address.toHexString()
  let itemId = event.params._itemId.toString()
  let id = getItemId(collectionAddress, itemId)

  let item = Item.load(id)

  if (item !== null) {
    item.available = item.available.minus(BigInt.fromI32(1))
    item.totalSupply = item.totalSupply.plus(BigInt.fromI32(1))

    item.save()
    handleMintNFT(event, collectionAddress, item)
  }

  // Bind contract
  let collectionContract = CollectionContract.bind(event.address)
  let isGlobalMinter = collectionContract.globalMinters(event.params._caller)

  if (isGlobalMinter) {
    return
  }

  let amountOfMintsAvailable = collectionContract.itemMinters(event.params._itemId, event.params._caller)

  if (amountOfMintsAvailable.equals(BigInt.fromI32(0)) && item != null) {
    let minterAddress = event.params._caller.toHexString()
    item.minters = removeItemMinter(item, minterAddress)
    // unset flag if minter is store
    if (minterAddress == getSaleAddress()) {
      item.searchIsStoreMinter = false
    }
    item.save()
  }
}

export function handleTransfer(event: Transfer): void {
  // Do not compute mints
  if (!isMint(event.params.from.toHexString())) {
    handleTransferNFT(event)
  }
}

export function handleSetGlobalMinter(event: SetGlobalMinter): void {
  let collectionAddress = event.address.toHexString()
  let storeAddress = getSaleAddress()
  let minterAddress = event.params._minter.toHexString()
  let collection = Collection.load(collectionAddress)

  if (!collection) {
    return
  }

  let minters = collection.minters

  if (event.params._value == true && minters != null) {
    minters.push(event.params._minter.toHexString())
    collection.minters = minters

    // set flag on collection
    if (minterAddress == storeAddress) {
      collection.searchIsStoreMinter = true

      if (!collection.firstListedAt) {
        collection.firstListedAt = event.block.timestamp
      }

      // loop over all items and set flag
      let itemCount = collection.itemsCount
      for (let i = 0; i < itemCount; i++) {
        let itemId = getItemId(collectionAddress, i.toString())
        let item = Item.load(itemId)
        if (item != null) {
          item.searchIsStoreMinter = true

          if (!item.firstListedAt) {
            item.firstListedAt = event.block.timestamp
          }

          item.save()
        }
      }
    }
  } else {
    let newMinters = new Array<string>(0)

    for (let i = 0; i < minters.length; i++) {
      if (minters[i] != event.params._minter.toHexString()) {
        newMinters.push(minters[i])
      }
    }

    // unset flag on collection
    if (minterAddress == storeAddress) {
      collection.searchIsStoreMinter = false
      // loop over all items and unset flag (only if store is not an item minter)
      let itemCount = collection.itemsCount
      for (let i = 0; i < itemCount; i++) {
        let itemId = getItemId(collectionAddress, i.toString())
        let item = Item.load(itemId)
        if (item != null) {
          // check if store is item minter
          let isStoreItemMinter = false
          let itemMinters = item.minters
          for (let j = 0; j < item.minters.length; j++) {
            if (storeAddress == itemMinters[i]) {
              isStoreItemMinter = true
            }
          }
          // set flag only if store is item minter, otherwise unset it
          item.searchIsStoreMinter = isStoreItemMinter
          item.save()
        }
      }
    }

    collection.minters = newMinters
  }

  collection.save()
}

export function handleSetGlobalManager(event: SetGlobalManager): void {
  let collection = Collection.load(event.address.toHexString())

  if (!collection) {
    return
  }

  let managers = collection.managers

  if (event.params._value == true && managers != null) {
    managers.push(event.params._manager.toHexString())
    collection.managers = managers
  } else {
    let newManagers = new Array<string>(0)

    for (let i = 0; i < managers.length; i++) {
      if (managers[i] != event.params._manager.toHexString()) {
        newManagers.push(managers[i])
      }
    }

    collection.managers = newManagers
  }

  collection.save()
}

export function handleSetItemMinter(event: SetItemMinter): void {
  let collectionAddress = event.address.toHexString()
  let storeAddress = getSaleAddress()
  let minterAddress = event.params._minter.toHexString()
  let itemId = event.params._itemId.toString()
  let id = getItemId(collectionAddress, itemId)

  let item = Item.load(id)
  if (!item) {
    return
  }

  let minters = item.minters

  if (event.params._value.gt(BigInt.fromI32(0))) {
    minters.push(minterAddress)
    item.minters = minters
    // if minter is store address, set flag
    if (minterAddress == storeAddress) {
      item.searchIsStoreMinter = true

      if (!item.firstListedAt) {
        item.firstListedAt = event.block.timestamp
      }
    }
  } else {
    item.minters = removeItemMinter(item, minterAddress)
    // if minter is store address, unset flag, but only if store is not global minter
    let collection = Collection.load(item.collection)
    if (collection != null && !collection.searchIsStoreMinter && minterAddress == storeAddress) {
      item.searchIsStoreMinter = false
    }
  }

  item.save()
}

export function handleSetItemManager(event: SetItemManager): void {
  let collectionAddress = event.address.toHexString()
  let itemId = event.params._itemId.toString()
  let id = getItemId(collectionAddress, itemId)

  let item = Item.load(id)
  if (!item) {
    return
  }

  let managers = item.managers

  if (event.params._value == true && managers != null) {
    managers.push(event.params._manager.toHexString())
    item.managers = managers
  } else {
    let newManagers = new Array<string>(0)

    for (let i = 0; i < managers.length; i++) {
      if (managers[i] != event.params._manager.toHexString()) {
        newManagers.push(managers[i])
      }
    }

    item.managers = newManagers
  }

  item.save()
}

export function handleSetApproved(event: SetApproved): void {
  let collectionAddress = event.address.toHexString()
  let collection = Collection.load(collectionAddress)

  if (!collection) {
    return
  }

  collection.isApproved = event.params._newValue

  // Bind contract
  let collectionContract = CollectionContract.bind(event.address)
  let itemsCount = collectionContract.itemsCount()

  for (let i = BigInt.fromI32(0); i.lt(itemsCount); i = i.plus(BigInt.fromI32(1))) {
    let id = getItemId(collectionAddress, i.toString())
    let item = Item.load(id)
    if (item) {
      item.searchIsCollectionApproved = event.params._newValue
      item.reviewedAt = event.block.timestamp
      item.save()
    }
  }

  collection.updatedAt = event.block.timestamp // to support old collections
  collection.reviewedAt = event.block.timestamp // to support old collections
  collection.save()
}

export function handleSetEditable(event: SetEditable): void {
  let collection = Collection.load(event.address.toHexString())
  if (collection != null) {
    collection.isEditable = event.params._newValue
    collection.save()
  }
}

export function handleCompleteCollection(event: Complete): void {
  let collection = Collection.load(event.address.toHexString())
  if (collection != null) {
    collection.isCompleted = true
    collection.save()
  }
}

export function handleTransferCreatorship(event: CreatorshipTransferred): void {
  let collection = Collection.load(event.address.toHexString())
  let newCreator = event.params._newCreator.toHexString()
  if (collection != null) {
    collection.creator = newCreator
    let itemCount = collection.itemsCount
    for (let i = 0; i < itemCount; i++) {
      let itemId = getItemId(collection.id, i.toString())
      let item = Item.load(itemId)
      if (item != null) {
        item.creator = newCreator
        item.save()
      }
    }
    collection.save()
  }
}

export function handleTransferOwnership(event: OwnershipTransferred): void {
  let collection = Collection.load(event.address.toHexString())
  if (collection != null) {
    collection.owner = event.params.newOwner.toHexString()
    collection.save()
  }
}