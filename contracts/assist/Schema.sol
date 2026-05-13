# schema.graphql

type Identity @entity {

  id: ID!

  tokenId: BigInt!

  owner: Bytes!

  reputation: BigInt!

  active: Boolean!

  createdAt: BigInt!



  # Active outgoing endorsements
  endorsementsGiven: [Endorsement!]!
    @derivedFrom(field: "fromIdentity")



  # Active incoming endorsements
  endorsementsReceived: [Endorsement!]!
    @derivedFrom(field: "toIdentity")



  # Historical revoked endorsements
  revokedEndorsements: [RevokedEndorsement!]!
    @derivedFrom(field: "targetIdentity")
}



type Endorsement @entity {

  id: ID!

  endorsementId: BigInt!

  fromIdentity: Identity!

  toIdentity: Identity!

  credentialType: String!

  message: String

  createdAt: BigInt!

  active: Boolean!
}



type RevokedEndorsement @entity {

  id: ID!

  endorsementId: BigInt!

  originalEndorsementId: String!

  fromIdentity: Identity!

  targetIdentity: Identity!

  revokedBy: Bytes!

  revokedAt: BigInt!

  reason: String
}