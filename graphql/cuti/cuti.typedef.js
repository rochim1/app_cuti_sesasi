const cutiTypeDefs = `
    type Cuti {
        _id: ID
        user_id: User
        alasan: String
        tanggal_pengajuan: String
        status_izin: EnumAksi
        tanggal_aksi: String 
        aktor_aksi: User
        terhitung_hari: String
        is_response_by_admin: Boolean
        tanggal_izin: String
        tanggal_masuk: String
        file_izin: String
        status: status
        deleted_at: String
        tipe_cuti: String
        filename: String
        verifikator_comment: String
    }

    enum EnumAksi {
        diterima
        ditolak
        diajukan
        dibatalkan
    }

    input CutiInput {
        tipe_cuti: ID
        alasan: String
        tanggal_aksi: String 
        tanggal_izin: String
        tanggal_masuk: String
        terhitung_hari: Int
        reduce_annually: Boolean

        aksi: EnumAksi
    }

    input FilterAllCuti {
        user_id: ID
        kalender: String
    }

    type gettingCuti {
        data: [Cuti]
        info_page: [countPages]
    }

    type ResponseUpdateDelete {
        is_successed: Boolean
        message: String
    }
    
    input inputAcceptCuti {
        aksi: EnumAksi
        verifikator_comment: String
    }

    extend type Query {
        GetAllCuti(filter: FilterAllCuti, pagination: pagination): gettingCuti
        GetOneCuti(cuti_id: ID!): Cuti
    }
    
    extend type Mutation {
        CreateCuti(input: CutiInput, file: Upload): Cuti
        UpdateCuti(cuti_id: ID!, input: CutiInput, file: Upload): Cuti
        DeleteCuti(cuti_id: ID!): Cuti
        GiveActionForCuti(_id: ID, input: inputAcceptCuti): Cuti
    }
`
module.exports = cutiTypeDefs;