import { getCategory } from "../utils/category";
import { cancelActiveOrder, clearNFTOrderProperties, getNFTId, getTokenURI, isMint } from '../utils/nfts'
import { Estate, NFT, Parcel } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'
import * as addresses from '../data/addresses';
import * as categories from '../utils/category/categories'
import { buildParcelFromNFT, getAdjacentToRoad, getDistanceToPlaza, getParcelImage, getParcelText, isInBounds } from "../utils/parcel";
import { buildEstateFromNFT, getEstateImage } from "../utils/estate";
import { createOrLoadAccount } from "../utils/account";
import { Transfer } from "../generated/Land/ERC721";

export function handleTransfer(event: Transfer): void {
    if (event.params.tokenId.toString() == '') {
        return
    }
    let contractAddress = event.address.toHexString()
    let category = getCategory(contractAddress)

    let id = getNFTId(
        category,
        event.address.toHexString(),
        event.params.tokenId.toString()
    )

    let nft = new NFT(id)
    nft.tokenId = event.params.tokenId
    nft.owner = event.params.to.toHex()
    nft.contractAddress = event.address
    nft.category = category
    nft.updatedAt = event.block.timestamp
    nft.soldAt = null
    nft.transferredAt = event.block.timestamp
    nft.sales = 0
    nft.volume = BigInt.fromI32(0)

    // if (contractAddress != addresses.Land) {
    //     nft.tokenURI = getTokenURI(event)
    // }

    if (isMint(event)) {
        nft.createdAt = event.block.timestamp

        // We're defaulting "Estate size" to one to allow the frontend to search for `searchEstateSize_gt: 0`,
        // necessary because thegraph doesn't support complex queries and we can't do `OR` operations
        nft.searchEstateSize = 1

        // We default the "in bounds" property for parcels and no-parcels alike so we can just add  `searchParcelIsInBounds: true`
        // to all queries
        nft.searchParcelIsInBounds = true

        nft.searchText = ''

        nft.searchIsLand = false

    } else {
        let oldNFT = NFT.load(id)
        if (cancelActiveOrder(oldNFT!, event.block.timestamp)) {
            nft = clearNFTOrderProperties(nft!)
        }
    }

    if (category == categories.PARCEL) {
        let parcel: Parcel
        if (isMint(event)) {
            parcel = buildParcelFromNFT(nft)
            nft.parcel = id
            nft.image = getParcelImage(parcel)
            nft.searchIsLand = true
            nft.searchParcelIsInBounds = isInBounds(parcel.x, parcel.y)
            nft.searchParcelX = parcel.x
            nft.searchParcelY = parcel.y
            nft.searchDistanceToPlaza = getDistanceToPlaza(parcel)
            nft.searchAdjacentToRoad = getAdjacentToRoad(parcel)
            nft.searchText = getParcelText(parcel, '')
        } else {
            parcel = new Parcel(nft.id)
            parcel.owner = nft.owner
        }
        parcel.save()
    } else if (category == categories.ESTATE) {
        let estate: Estate
        if (isMint(event)) {
            estate = buildEstateFromNFT(nft)
            nft.estate = id
            nft.image = getEstateImage(estate)
            nft.searchIsLand = true
            nft.searchDistanceToPlaza = -1
            nft.searchAdjacentToRoad = false
            nft.searchEstateSize = estate.size
        } else {
            estate = new Estate(nft.id)
            estate.owner = nft.owner
        }
        estate.save()
    } else if (category == categories.WEARABLE) {

    }

    createOrLoadAccount(event.params.to)

    nft.save()
}