const fs = require('fs');
const csv = require('csv-parser');
const wilayahUtilitiy = require('./wilayah.utilities');

const GetListKota = async function (parent, params, ctx) {
    const listKota = await wilayahUtilitiy.GetListKota();
    return listKota;
};
const GetListKabupaten = async function (parent, { nama_kota, id_kota }, ctx) {
    const listKabupaten = await wilayahUtilitiy.GetListKabupaten(nama_kota, id_kota);
    return listKabupaten;
};
const GetListKecamatan = async function (parent, { nama_kabupaten, id_kabupaten }, ctx) {
    const listKecamatan = await wilayahUtilitiy.GetListKecamatan(nama_kabupaten, id_kabupaten);
    return listKecamatan;
};
const GetListKelurahan = async function (parent, { nama_kecamatan, id_kecamatan }, ctx) {
    const listKelurahan = await wilayahUtilitiy.GetListKelurahan(nama_kecamatan, id_kecamatan);
    return listKelurahan;
};


module.exports = {
    Query: {
        GetListKota,
        GetListKabupaten,
        GetListKecamatan,
        GetListKelurahan
    },
    Mutation: {}
};
