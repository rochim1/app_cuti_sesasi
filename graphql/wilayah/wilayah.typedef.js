const wilayahTypeDefs = `
    type kota{
        ID: String
        KOTA: String
    }

    type kabupaten{
        ID: String
        ID_KOTA: String
        KABUPATEN: String
    }

    type kecamatan{
        ID: String
        ID_KABUPATEN: String
        KECAMATAN: String
    }

    type kelurahan{
        ID: String
        ID_KECAMATAN: String
        KELURAHAN: String
    }

    extend type Query {
        GetListKota: [kota]
        GetListKabupaten(nama_kota: String, id_kota: String) : [kabupaten]
        GetListKecamatan(nama_kabupaten: String, id_kabupaten: String) : [kecamatan]
        GetListKelurahan(nama_kecamatan: String, id_kecamatan: String) : [kelurahan]
    }
`
module.exports = wilayahTypeDefs