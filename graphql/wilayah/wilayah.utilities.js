const fs = require('fs');
const csv = require('csv-parser');

// Fungsi untuk membaca data dari file CSV
function readCSVFile(filePath, callback) {
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            callback(results);
        });
}

function getIdKota(namaKota) {
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kota.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    let kota = rows.find(kota => kota.KOTA === namaKota.toUpperCase())
                    resolve(kota.ID)
                }
            } catch (error) {
                return []
            }
        });
    })
}

function getIdKabupaten(namaKabupaten) {
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kabupaten.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    let kabupaten = rows.find(kabupaten => kabupaten.KABUPATEN === namaKabupaten.toUpperCase())
                    resolve(kabupaten && kabupaten.ID ? kabupaten.ID : null)
                }
            } catch (error) {
                return []
            }
        });
    })
}

function getIdKecamatan(namaKecamatan) {
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kecamatan.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    let kecamatan = rows.find(kecamatan => kecamatan.KECAMATAN === namaKecamatan.toUpperCase())
                    resolve(kecamatan && kecamatan.ID ? kecamatan.ID : null)
                }
            } catch (error) {
                return []
            }
        });
    })
}

function getIdKelurahan(namaKelurahan) {
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kelurahan.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    let kelurahan = rows.find(kelurahan => kelurahan.KELURAHAN === namaKelurahan.toUpperCase())
                    resolve(kelurahan && kelurahan.ID ? kelurahan.ID : null)
                }
            } catch (error) {
                return []
            }
        });
    })
}

function GetListKota() {
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kota.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    resolve(rows)
                }
            } catch (error) {
                return []
            }
        });
    })
}

async function GetListKabupaten(namaKota, idKota) {
    if (!idKota) idKota = await getIdKota(namaKota);
    if (!idKota) { return []; }
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kabupaten.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    const listKabupaten = rows.reduce((newArray, kabupaten) => {
                        if (kabupaten.ID_KOTA === idKota) {
                            newArray.push(kabupaten)
                        }
                        return newArray
                    }, [])
                    resolve(listKabupaten)
                }
            } catch (error) {
                return []
            }
        });
    })
}

async function GetListKecamatan(namaKabupaten, idKabupaten) {
    if (!idKabupaten) idKabupaten = await getIdKabupaten(namaKabupaten);
    if (!idKabupaten) { return []; }
    return new Promise((resolve, reject) => {
        const csvFilePath = './graphql/wilayah/data/kecamatan.csv';
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    const listkecamatan = rows.reduce((newArray, kecamatan) => {
                        if (kecamatan.ID_KABUPATEN === idKabupaten) {
                            newArray.push(kecamatan)
                        }
                        return newArray;
                    }, [])
                    resolve(listkecamatan)
                }
            } catch (error) {
                return []
            }
        });
    })
}

async function GetListKelurahan(namaKecamatan, idKecamatan) {
    if (!idKecamatan) idKecamatan = await getIdKecamatan(namaKecamatan);
    if (!idKecamatan) { return []; }
    const csvFilePath = './graphql/wilayah/data/kelurahan.csv';
    return new Promise((resolve, reject) => {
        readCSVFile(csvFilePath, (rows) => {
            try {
                if (rows && rows.length) {
                    const listKelurahan = rows.reduce((newArray, kelurahan) => {
                        if (kelurahan.ID_KECAMATAN === idKecamatan) {
                            newArray.push(kelurahan)
                        }
                        return newArray;
                    }, [])
                    resolve(listKelurahan) 
                }
            } catch (error) {
                return []
            }
        });
    })
}

module.exports = {
    getIdKota,
    getIdKabupaten,
    getIdKecamatan,
    getIdKelurahan,
    GetListKota,
    GetListKabupaten,
    GetListKecamatan,
    GetListKelurahan
}