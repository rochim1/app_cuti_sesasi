const DataLoader = require('dataloader');
const CutiModel = require('./cuti.model');

let batchCuti = async(cutiIds) => {
    let cuti = await CutiModel.find({
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

const cutiLoader = new DataLoader(batchCuti);

module.exports = cutiLoader