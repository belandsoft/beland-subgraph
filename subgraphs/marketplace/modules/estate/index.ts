import { NFT, Estate } from '../../generated/schema'

export function buildEstateFromNFT(nft: NFT): Estate {
  let estate = new Estate(nft.id)

  estate.tokenId = nft.tokenId
  estate.owner = nft.owner
  estate.size = 0
  estate.parcelDistances = []
  estate.adjacentToRoadCount = 0

  return estate
}

export function getEstateImage(estate: Estate): string {
  return (
    'https://testnet-api.memetaverse.club/v1/estates/' +
    estate.tokenId.toString() +
    '/map.png'
  )
}