const cutiTypeDefs = `
    type Cuti {
        _id: ID
        user_id: User
        alasan: String
        tanggal_pengajuan: String
        status_izin: EnumAksi
        tanggal_aksi: String 
        aktor_aksi: User
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

    input InputPengaturanCuti {
        quota_cuti: Int
        accumulate_month: Int
        max_cuti_accumulate: Int
        max_cuti_req: Int
        min_cuti_req: Int
        cuti_approver: [ID]
        is_need_all_approver: Boolean
        forward_divisi_user: Boolean
        forward_selected_divisi: [ID]
    }
    
    type PengaturanCutiType {
        setting_id: ID
        quota_cuti: Int
        accumulate_month: Int
        max_cuti_accumulate: Int
        max_cuti_req: Int
        min_cuti_req: Int
        cuti_approver: [User]
        is_need_all_approver: Boolean
        forward_divisi_user: Boolean
        forward_selected_divisi: [Divisi]
    }

    extend type Query {
        GetAllCuti(filter: FilterAllCuti, pagination: pagination): gettingCuti
        GetOneCuti(cuti_id: ID!): Cuti
        GetPengaturanCuti: PengaturanCutiType
    }
    
    extend type Mutation {
        CreateCuti(input: CutiInput, file: Upload): Cuti
        UpdateCuti(cuti_id: ID!, input: CutiInput, file: Upload): Cuti
        DeleteCuti(cuti_id: ID!): Cuti
        UpdatePengaturanCuti(pengaturan_id: ID, input: InputPengaturanCuti): PengaturanCutiType
    }
`
module.exports = cutiTypeDefs;