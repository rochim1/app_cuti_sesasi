const cutiBillingsTypeDefs = `

  type CutiBilling {
    id: ID!
    user_id: User
    tahun: String
    sisa_cuti: Int
    taken_annually: Int
    taken_not_annually: Int
    total_taken: Int
    carried_cuti: Int
    exp_cuti: Int
    instansi_id: ID
    status: String
  }

  input CutiBillingInput {
    user_id: ID
    tahun: String
    sisa_cuti: Int
    taken_annually: Int
    taken_not_annually: Int
    total_taken: Int
    carried_cuti: Int
    exp_cuti: Int
    instansi_id: ID
    status: String
  }

  type Query {
    getAllCutiBillings: [CutiBilling]
    getCutiBillings: CutiBilling
  }

  type Mutation {
    updateCutiBilling(id: ID!, input: CutiBillingInput): CutiBilling
  }
`;

module.exports = cutiBillingsTypeDefs;