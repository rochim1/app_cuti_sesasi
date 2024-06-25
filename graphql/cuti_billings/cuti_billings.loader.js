const DataLoader = require('dataloader');
const CutiBillingsModel = require('./cuti_billings.model');

let batchCutiBillings = async(cutiBilIds) => {
    let cuti = await CutiBillingsModel.find({
        _id: {
            $in: cutiBilIds
        },
        status: 'active'
    })

    let obj = {};
    cuti.forEach(val => {
        obj[val._id] = val
    })

    return cutiBilIds.map(id => obj[id]);
}

const CutiBillingsLoader = new DataLoader(batchCutiBillings);

module.exports = CutiBillingsLoader