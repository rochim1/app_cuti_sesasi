const typeDef = `
    enum genders{
        m
        f
    }
    
    enum rolesEnum{
        admin
        verifikator
        ordinary
    }

    enum EnumEmployStatus{
        permanent
        contract
        probation
        apprenticeship
    }
    
    enum access_via{
        mobile_app
        web_browser
    }

    type ExportResult {
        name: String
        data: String
    }

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
        bufferFile: String!
    }
    
    enum status{
        active
        deleted
    }
    
    enum EnumStatusMenikah{
        belum_kawin
        kawin
        cerai_hidup
        cerai_mati
    }

    enum EnumSorting{
        asc
        desc
    }

    enum statusUser{
        active
        resign
        deleted
    }

    type BooleanResponse {
        is_successed: Boolean
        message: String
    }
    
    type AdditionalContact{
        name: String
        relation: String
        telpon_number: String
        address: String
        email: String
    }
    
    input AdditionalContactInput{
        name: String
        relation: String
        telpon_number: String
        address: String
        email: String
    }

    input FilterUser {
        _ids: [ID]
        status: statusUser
        name: String
        employ_status: EnumEmployStatus
        gender: String
    }

    input SortingUser {
        username: EnumSorting
        name: EnumSorting
    }

    input UserInput{
        no_identitas: String
        role: rolesEnum
        name: String!
        tipe_identitas: TipeIdentitas
        username: String
        gender: genders
        email: String
        password: String
        jabatan: String
        divisi: String
        remember_token: String
        address: String
        domisili: String
        pos_code: String
        url_foto: Upload
        status_menikah: EnumStatusMenikah
        pendidikan_terakhir: String
        jurusan: String
        place_of_birth: String
        date_of_birth: String
        telp_number: String
        date_join: String
        date_resign: String
        additional_contact: [AdditionalContactInput]
        deleted_at: String
        delete_reason: String
        resign_reason: String
        kecamatan: String
        kabupaten: String
        kelurahan: String
        provinsi: String
        keterangan: String
        employ_status: EnumEmployStatus
    }

    enum TipeIdentitas {
        sim
        ktp
        pasport
    }

    input LoginInput{
        access_via: access_via
        email_or_username: String
        password: String
        mac_address: String
        remember_me: Boolean
        remember_token: String
    }

    input exportUsersInput {
        user_ids: [ID]
        delimiter: enumDelimiter
        offset: Int
    }

    enum enumDelimiter{
        semicolon
        comma
    }    

    type User{
        _id: ID
        tipe_identitas: String
        no_identitas: String
        role: rolesEnum
        name: String
        username: String
        gender: genders
        email: String
        address: String
        domisili: String
        pos_code: String
        url_foto: String
        status_menikah: EnumStatusMenikah
        pendidikan_terakhir: String
        jurusan: String
        place_of_birth: String
        date_of_birth: String
        telp_number: String
        date_join: String
        date_resign: String
        status: statusUser
        createdAt: String
        updatedAt: String
        is_admin: Boolean
        is_created: Boolean
        mac_address: String
        additional_contact: [AdditionalContact]
        deleted_at: String
        delete_reason: String
        resign_reason: String
        is_presensi_today: Boolean
        is_cuti: Boolean
        sisa_cuti: Int
        kecamatan: String
        kabupaten: String
        kelurahan: String
        provinsi: String
        keterangan: String
        employ_status: EnumEmployStatus
    }

    type Authentication{
        token: String
        user: User
    }

    type changePassword{
        message: String
    }

    type resultUsers {
        data: [User]
        info_page: [countPages]
    }

    type ProfileImage {
        url_foto: String
    }

    type TotalUser {
        total_user: Int
        user_aktif: Int
        user_resign: Int
        user_deleted: Int
    }

    input filterUserDiversity {
        status_user: statusUser
    }

    type resultGenderDiversity {
        total_men: Int
        total_women: Int
        total_gender_undefined: Int
    }

    type resultEmployDiversity {
        total_permanen: Int
        total_kontrak: Int
        total_percobaan: Int
        total_magang: Int
    }

    input pagination {
        page: Int
        limit: Int
    }

    type countPages {
        count: Int
    }

    extend type Query {
        GetAllUser(filter: FilterUser, sorting: SortingUser, pagination: pagination): resultUsers
        GetOneUser(_id: ID): User
    }

    extend type Mutation {
        CreateUser(input: UserInput): User
        UpdateUser(id_user: ID, input: UserInput): User
        Login(input: LoginInput): Authentication
    }
`;

module.exports = typeDef