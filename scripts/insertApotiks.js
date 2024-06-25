/**
 * ***************************************************
 * to run the script -> node ./scripts/insertApotiks.js
 *  place or move .CSV to same folder with the scripts
 * *****************************************************
 */

const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './.env' });
const fs = require('fs');
const csv = require('csv-parser');
const stripBom = require('strip-bom-stream');

const ApotikModel = require('../graphql/apotik/apotik.model');

const runningScript = async () => {
  console.time('SCRIPT RUN');
  const startTime = moment().format('DD/MM/YYYY HH:mm');

  const filePath = `${__dirname}/dataApotik.csv`; //********** set file csv name here
  let dataCsv = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(stripBom()) //********** Bom
      .pipe(csv({ separator: `,` })) //********** choose delimiter or separator
      .on('data', (data) => {
        dataCsv.push(data);
      })
      .on('end', async () => {
        //********** counter
        let countCreated = 0;
        let countUpdated = 0;

        for (const eachData of dataCsv) {
          //********** handle 2 csv berbeda untuk field kode_apotik
          const keyOfApotik = eachData['KODE APOTIK'] ? eachData['KODE APOTIK'] : eachData['NoInduk'] ? eachData['NoInduk'] : '';

          //********** skip kalo line di csv kosong
          if (!keyOfApotik) continue;

          //********** object untuk create
          const apotikObjCreate = {
            kode_apotik: keyOfApotik,
            nama_apotik: eachData['Nama'] ? eachData['Nama'] : '',
            alamat: eachData['Alamat'] ? eachData['Alamat'] : '',
            delete_reason: eachData['delete_reason'] ? eachData['delete_reason'] : '',
            status: eachData['Status'] ? 'active' : 'active', // status should be active, its purpose to admin can decide should delete or not in ui
            // status: eachData['Status'] ? eachData['Status'] : '',
            latitude: eachData['Latitude'] ? eachData['Latitude'] : '',
            longitude: eachData['Longitude'] ? eachData['Longitude'] : '',
            kode_pos: eachData['Kode Pos'] ? eachData['Kode Pos'] : '',
            provinsi: eachData['Provinsi'] ? eachData['Provinsi'] : '',
            kota: eachData['Kota'] ? eachData['Kota'] : '',
            kabupaten: eachData['Kabupaten'] ? eachData['Kabupaten'] : '',
            kecamatan: eachData['Kecamatan'] ? eachData['Kecamatan'] : '',
            kelurahan: eachData['Kelurahan'] ? eachData['Kelurahan'] : '',
            telpon_number: eachData['Kontak'] ? eachData['Kontak'] : '',
            NPWP: eachData['NPWP'] ? eachData['NPWP'] : '',
            NPPKP: eachData['NPPKP'] ? eachData['NPPKP'] : '',
            NBF: eachData['pbf_id'] ? eachData['pbf_id'] : '',
            SIPA: eachData['NoSIPA'] ? eachData['NoSIPA'] : '',
            no_ijin: eachData['NoIjin'] ? eachData['NoIjin'] : '',
            kode_petugas: eachData['KodePetugas'] ? eachData['KodePetugas'] : '',
            is_candidate: false
          };

          //********** cek data apotik yang sudah ada
          const existingApotik = await ApotikModel.findOne({ kode_apotik: keyOfApotik }).lean();

          //********** inisiasi object untuk update data apotik yg masih kosong
          let apotikObjUpdate = {};

          //********** cek tiap field apotik yg blm ada isinya
          for (const eachField in existingApotik) {
            if (['', null].includes(existingApotik[eachField])) {
              apotikObjUpdate[eachField] = apotikObjCreate[eachField];
            }
          }

          //********** decision untuk create atau update
          if (!existingApotik) {
            await ApotikModel.create(apotikObjCreate);
            countCreated++;
          } else {
            await ApotikModel.findByIdAndUpdate(existingApotik._id, {
              $set: apotikObjUpdate,
            });
            countUpdated++;
          }
        }

        //********** tampilkan counter
        console.log(`Apotik created: ${countCreated}`);
        console.log(`Apotik updated: ${countUpdated}`);
        console.log(`All data Apotik: ${dataCsv.length}`);

        //********** keluar dari promise
        resolve();
      });
  });

  console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
  console.timeEnd('SCRIPT RUN');
};

//********** mongoose handle
mongoose
  .connect(`${process.env.DB_DEV}`)
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
