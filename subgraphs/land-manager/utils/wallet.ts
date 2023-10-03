import {  Address } from '@graphprotocol/graph-ts'
import { Wallet } from '../generated/schema'

export function createWallet(id: Address): void {
  let wallet = Wallet.load(id.toHex())

  if (wallet == null) {
    wallet = new Wallet(id.toHex())
    wallet.address = id
  }

  wallet.save()
}