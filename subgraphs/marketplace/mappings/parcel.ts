import { Address } from '@graphprotocol/graph-ts'
import { Parcel, NFT } from '../generated/schema'
import { ERC721 } from '../generated/templates'
import { buildCount } from '../modules/count'
import { getNFTId } from '../modules/nft'
import { decodeTokenId, getParcelText } from '../modules/parcel'
import { buildData, DataType } from '../modules/data'
import * as categories from '../modules/category/categories'
import * as addresses from '../data/addresses'
import { MetadataUpdate } from '../generated/LANDRegistry/LANDRegistry'
import { OwnershipTransferred } from '../generated/ERC721Bid/ERC721Bid'

export function handleInitialize(_: OwnershipTransferred): void {
  let count = buildCount()

  if (count.started == 0) {
    ERC721.create(Address.fromString(addresses.getLANDRegistry()))
    ERC721.create(Address.fromString(addresses.getEstateRegistry()))
    count.started = 1
    count.save()
  }
}

export function handleUpdate(event: MetadataUpdate): void {
  let parcelId = event.params.landId.toString()
  let data = event.params.data.toString()

  let id = getNFTId(categories.PARCEL, addresses.getLANDRegistry(), parcelId)

  let parcel = new Parcel(id)
  parcel.rawData = data

  let parcelData = buildData(id, data, DataType.PARCEL)
  if (parcelData != null) {
    parcel.data = id
    parcelData.save()

    let coordinates = decodeTokenId(event.params.landId)
    parcel.x = coordinates[0]
    parcel.y = coordinates[1]

    let nft = new NFT(id)
    nft.name = parcelData.name
    nft.searchText = getParcelText(parcel, parcelData.name!)
    nft.updatedAt = event.block.timestamp
    nft.save()
  }

  parcel.save()
}