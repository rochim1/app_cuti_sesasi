const DataLoader = require('dataloader');
const KategoriCutiModel = require('./kategori_cuti.model');

let batchKategoriCuti = async(cutiIds) => {
    let cuti = await KategoriCutiModel.find({
        _id: {
            $in: cutiIds
        },
        status: 'active'
    })

    let obj = {};
    cuti.forEach(val => {
        obj[val._id] = val
    })

    return cutiIds.map(id => obj[id]);
}

const kategoriCutiLoader = new DataLoader(batchKategoriCuti);

module.exports = kategoriCutiLoader