const typeDef = `
    enum genders{
        m
        f
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
        divisi_id: ID
        tipe: EnumEmployStatus
        gender: String
    }

    input SortingUser {
        username: EnumSorting
        name: EnumSorting
    }

    input UserInput{
        no_identitas: String
        name: String!
        username: String!
        gender: genders
        email: String!
        password: String
        user_type_id: ID
        divisi: ID
        jabatan: String
        level: String
        remember_token: String
        identity_type: ID
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
        instansi_id: ID
        manager_id: ID
        date_join: String
        date_resign: String
        is_admin: Boolean
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

    input UserUpdateInput {
        no_identitas: String
        name: String
        username: String
        gender: genders
        email: String
        password: String
        divisi: ID
        jabatan: String
        level: String
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
        is_admin: Boolean
        additional_contact: [AdditionalContactInput]
        deleted_at: String
        delete_reason: String
        resign_reason: String
        kecamatan: String
        kabupaten: String
        kelurahan: String
        provinsi: String
        keterangan: String
        isFotoDeleted: Boolean
        employ_status: EnumEmployStatus
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
        delimiter: enumdelimiter
        offset: Int
    }

    enum enumdelimiter{
        semicolon
        comma
    }    

    type User{
        _id: ID
        no_identitas: String
        name: String
        username: String
        gender: genders
        email: String
        identity_type: TipeIdentitas
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
        instansi_id: Instansi
        manager_id: ID
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
        jam_masuk_divisi: String,
        jam_pulang_divisi: String
        employ_status: EnumEmployStatus
    }

    type Authentication{
        token: String
        user: User
        permission: Permission
    }

    type changePassword{
        message: String
    }

    type gettingUser {
        users: [User]
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

    extend type Query {
        GetAllUser(filter: FilterUser, sorting: SortingUser, pagination: pagination): gettingUser
        GetOneUser(_id: ID): User
        GetTotalUser: TotalUser
        GetOneUserForInventaris(_id: ID, id_inventaris: ID): User
        GetProfileImage(_id: ID): ProfileImage
        GetGenderDiversity( filter: filterUserDiversity ): resultGenderDiversity
        GetEmployDiversity( filter: filterUserDiversity ): resultEmployDiversity
    }

    extend type Mutation {
        CreateUserByAdmin(input: UserInput, foto: Upload): User
        CreateUser(input: UserInput): User
        Login(input: LoginInput): Authentication
        UpdateProfile(input: UserUpdateInput, _id: ID): BooleanResponse
        DeleteUser(_id: ID, reason: String, is_resign: Boolean): BooleanResponse
        AddContact(input: [AdditionalContactInput], _id:ID): BooleanResponse
        Logout: BooleanResponse
        RequestChangePassword(_id: ID, email: String, is_web: Boolean, new_password: String): changePassword
        RequestChangePasswordWeb(_id: ID): changePassword
        UploadImage(file: Upload!): File!
        ImportUser(file: Upload!): [User]
        exportUsers(input: exportUsersInput): ExportResult
        ActiveUser(_id: ID): BooleanResponse
        checkUserByEmail(emailOrUsername: String): User
    }
`;

module.exports = typeDef