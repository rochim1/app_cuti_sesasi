/**
 * ***************************************************
 * to run the script -> node ./scripts/update_tanggal_presensi_to_array.js
 *  place or move .CSV to same folder with the scripts
 * *****************************************************
 */

const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({
  path: './.env'
});

const PresensiModel = require('../graphql/presensi/presensi.model');
const presensiModel = require('../graphql/presensi/presensi.model');

const runningScript = async () => {
  console.time('update_tanggal_presensi_to_array RUN');
  const startTime = moment().format('DD/MM/YYYY HH:mm');
  let query = {
    status: 'active'
  }
  const jumlahPresensi = await PresensiModel.count(query)
  let limit = 100
  let skip = 0
  let countPresensiUpdated = 0

  const loopingTotal = Math.ceil(jumlahPresensi / limit)

  for (let index = 1; index <= loopingTotal; index++) {

    let presensiData = await PresensiModel.aggregate([{
        $match: query
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]).collation({
      locale: 'id'
    }).allowDiskUse(true);

    if (presensiData && presensiData.length) {
      for (const presensi of presensiData) {
        
        if (!presensi._id & presensi.tanggal_presensi) {
          continue;
        }
        
        let updatePresensi = await presensiModel.findOneAndUpdate({ _id: presensi._id }, {
          $addToSet : {
            date_presences: presensi.tanggal_presensi
          }
        },{
          new: true
        });

        if (updatePresensi) {
          console.log(updatePresensi._id)
          countPresensiUpdated ++
        }
      }
    }

    skip = limit * index;
  }

  console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
  console.log(`UPDATED ${countPresensiUpdated} presensis`)
  console.timeEnd('SCRIPT RUN');
};

//********** mongoose handle
mongoose
  .connect(`${process.env.DB_CONNECT}`)
  .then(() => console.log("Database connect"))
  .catch((err) => console.log("Database disconnected", err));

mongoose.connection.on('connected', async () => {
  await runningScript();
  process.exit();
});
mongoose.connection.on('error', (err) => {
  console.error('Cannot Connect:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from DB');
});