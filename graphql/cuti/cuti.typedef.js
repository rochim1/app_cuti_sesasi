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
    }

    enum tipeCuti {
        izin_sakit
        izin_cuti_tahunan
        izin_urusan_keluarga
        izin_kehamilan
        lainnya
    }
    enum EnumAksi {
        diterima
        ditolak
        diajukan
    }

    input CutiInput {
        cuti_id: ID
        tipe_cuti: tipeCuti
        alasan: String
        status_izin: EnumAksi
        tanggal_aksi: String 
        tanggal_izin: String
        tanggal_masuk: String
        terhitung_hari: String
    }

    input FilterAllCuti {
        detail_cuti: Boolean
        kalender: String
    }

    type gettingCuti {
        cuti: [Cuti]
        info_page: [countPages]
    }

    type ResponseUpdateDelete {
        is_successed: Boolean
        message: String
    }

    extend type Query {
        GetAllCuti(filter: FilterAllCuti, pagination: pagination): gettingCuti
        GetOneCuti(cuti_id: ID!): Cuti
    }
    
    extend type Mutation {
        CreateCuti(input: CutiInput, file: Upload): Cuti
        UpdateCuti(cuti_id: ID!, input: CutiInput, file: Upload): Cuti
        DeleteCuti(cuti_id: ID!): Cuti
    }
`
module.exports = cutiTypeDefs;