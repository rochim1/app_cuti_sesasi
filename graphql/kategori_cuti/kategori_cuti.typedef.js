const kategoriCutiTypeDefs = `
  enum StatusKategoriCuti {
    active
    inactive
    deleted
  }

  enum TipeKategoriCuti {
    burned_annually
    accumulate_annually
  }

  type KategoriCuti {
    _id: ID!
    nama_kategori_cuti: String
    user_created: User
    tipe: TipeKategoriCuti
    effective_date: String
    exp_date: String
    is_special: Boolean
    jumlah_kuota_hari: Int

    sugested_day_off: Int
    allow_half_day: Boolean
    allow_exceed: Boolean
    number_of_exceed: Int
    keterangan: String
    delegated_to_all: Boolean
    need_upload_file: Boolean
    selected_delegated: [EnumEmployStatus]
    selected_users: [User]

    status: StatusKategoriCuti
    
    allow_min_gap: Boolean
    min_gap_before_cuti: Int

    deleted_at: String
    createdAt: String
    updatedAt: String
  }

  input KategoriCutiInput {
    nama_kategori_cuti: String
    user_created: ID
    tipe: TipeKategoriCuti
    effective_date: String
    exp_date: String
    is_special: Boolean
    jumlah_kuota_hari: Int

    sugested_day_off: Int
    allow_half_day: Boolean
    allow_exceed: Boolean
    number_of_exceed: Int
    keterangan: String
    delegated_to_all: Boolean
    need_upload_file: Boolean
    selected_delegated: [EnumEmployStatus]
    selected_users: [ID]

    status: StatusKategoriCuti

    allow_min_gap: Boolean
    min_gap_before_cuti: Int

    deleted_at: String
  }

  input filterKategriCuti {
    nama_kategori_cuti: String
    tipe: TipeKategoriCuti
    jumlah_kuota_hari: Int
    allow_half_day: Boolean

    get_only_ids: Boolean
  }

  input SortingKategoriCti {
    nama_kategori_cuti: EnumSorting
    jumlah_kuota_hari: EnumSorting
    sugested_day_off: EnumSorting
  }

  input exportKategoriCutiInput {
    kategoriCuti_ids: [ID]
    delimiter: enumDelimiter
    offset: Int
}

  type GettingKategoriCuti {
    kategoriCuti: [KategoriCuti]
    info_page: [countPages]
  }

  type getIds{
    ids: [ID]
  }
  
  type Query {
    GetOneKategoriCuti(_id: ID!): KategoriCuti
    SelectAllKategoriCuti(filter: filterKategriCuti, sorting: SortingKategoriCti): getIds
    GetAllKategoriCuti(filter: filterKategriCuti, sorting: SortingKategoriCti): GettingKategoriCuti
    GetAllKategoriCutiResponsible(filter: filterKategriCuti, sorting: SortingKategoriCti): GettingKategoriCuti
    CheckAvaliableKategoriCutiName(nama_kategori_cuti: String, exception_ids: [ID] ): Boolean
  }

  type Mutation {
    CreateKategoriCuti(input: KategoriCutiInput): KategoriCuti
    UpdateKategoriCuti(_id: ID!, input: KategoriCutiInput): KategoriCuti
    DeleteKategoriCuti(_id: ID!): KategoriCuti
    ForceDeleteKategoriCuti(_id: ID!): BooleanResponse
    ExportKateogriCuti(input: exportKategoriCutiInput): ExportResult
  }
`;

module.exports = kategoriCutiTypeDefs;