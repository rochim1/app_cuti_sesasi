/**
 * ***************************************************
 * to run the script -> node ./scripts/update_data_divisi.js
 *  place or move .CSV to same folder with the scripts
 * *****************************************************
 */

const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({
  path: './.env'
});

const DivisiModel = require('../graphql/divisi/divisi.model');

const runningScript = async () => {
  console.time('update_nama_divisi RUN');
  const startTime = moment().format('DD/MM/YYYY HH:mm');
  let query = {
    status: 'active'
  }
  const jumlahDivisi = await DivisiModel.count(query)
  let limit = 100
  let skip = 0
  let countDivisiUpdated = 0

  const loopingTotal = Math.ceil(jumlahDivisi / limit)

  for (let index = 1; index <= loopingTotal; index++) {

    let DivisiData = await DivisiModel.aggregate([{
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

    if (DivisiData && DivisiData.length) {
      for (const divisi of DivisiData) {

        // translate start
        let newNamaDivisi = "";
        const namaDivisi = divisi.nama_divisi;
        if (namaDivisi.toUpperCase() == "MARKETING") {
          newNamaDivisi = "Marketing"
        } else if (namaDivisi.toUpperCase() == "COURIER") {
          newNamaDivisi = "Kurir"
        } else if (namaDivisi.toUpperCase() == "OPERATIONAL_MANAGER") {
          newNamaDivisi = "Menejer Operasional"
        } else if (namaDivisi.toUpperCase() == "WAREHOUSE_STAFF") {
          newNamaDivisi = "Staff Gudang"
        } else if (namaDivisi.toUpperCase() == "APJ_ALKES") {
          newNamaDivisi = "APJ ALkes"
        } else if (namaDivisi.toUpperCase() == "APOTEKER") {
          newNamaDivisi = "Apoteker"
        } else if (namaDivisi.toUpperCase() == "ADMIN_STAFF") {
          newNamaDivisi = "Staff Admin"
        } else if (namaDivisi.toUpperCase() == "DIRECTOR") {
          newNamaDivisi = "Direktur"
        } else if (namaDivisi.toUpperCase() == "IT_STAFF") {
          newNamaDivisi = "Staff IT"
        } else if (namaDivisi.toUpperCase() == "TAX_STAFF") {
          newNamaDivisi = "Staff Perpajakan"
        } else if (namaDivisi.toUpperCase() == "OWNER") {
          newNamaDivisi = "Owner"
        } else if (namaDivisi.toUpperCase() == "ACCOUNTING") {
          newNamaDivisi = "Akuntan"
        }

        let updatedivisi = await DivisiModel.findOneAndUpdate({
          _id: divisi._id
        }, {
          $set: {
            nama_divisi: newNamaDivisi
          }
        }, {
          new: true
        });

        if (updatedivisi) {
          // dont forget to do this in mongodb 
          // db.divisis.getIndexes()
          // db.divisis.dropIndex("nama_divisi_1")
          console.log(updatedivisi._id)
          countDivisiUpdated++
        }
      }
    }

    skip = limit * index;
  }

  console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
  console.log(`UPDATED ${countDivisiUpdated} divisis`)
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