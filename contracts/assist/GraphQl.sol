// mapping.ts

import {

  IdentityCreated,

  EndorsementCreated,

  EndorsementRevoked

} from "../generated/IdentityRegistry/IdentityRegistry"



import {

  Identity,

  Endorsement,

  Revocation

} from "../generated/schema"



import { BigInt } from "@graphprotocol/graph-ts"



export function handleIdentityCreated(
  event: IdentityCreated
): void {

  let identity =
    new Identity(
      event.params.tokenId.toString()
    )



  identity.tokenId =
    event.params.tokenId

  identity.owner =
    event.params.owner

  identity.reputation =
    BigInt.fromI32(0)

  identity.createdAt =
    event.block.timestamp

  identity.active = true



  identity.save()
}



export function handleEndorsementCreated(
  event: EndorsementCreated
): void {

  let endorsement =
    new Endorsement(
      event.params.endorsementId.toString()
    )



  endorsement.endorsementId =
    event.params.endorsementId

  endorsement.fromIdentity =
    event.params.fromToken.toString()

  endorsement.toIdentity =
    event.params.toToken.toString()

  endorsement.credentialType =
    "GENERAL"

  endorsement.message =
    ""

  endorsement.createdAt =
    event.block.timestamp

  endorsement.revoked =
    false

  endorsement.active =
    true



  endorsement.save()
}



export function handleEndorsementRevoked(
  event: EndorsementRevoked
): void {

  let endorsement =
    Endorsement.load(
      event.params.endorsementId.toString()
    )



  if (endorsement) {

    endorsement.revoked =
      true

    endorsement.active =
      false

    endorsement.save()



    let revocation =
      new Revocation(
        event.transaction.hash.toHex()
      )



    revocation.endorsement =
      endorsement.id

    revocation.targetIdentity =
      endorsement.toIdentity

    revocation.revokedBy =
      event.transaction.from

    revocation.reason =
      "Manual revocation"

    revocation.revokedAt =
      event.block.timestamp



    revocation.save()



    endorsement.revocation =
      revocation.id

    endorsement.save()
  }
}