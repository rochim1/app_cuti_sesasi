/**
 * ***************************************************
 * to run the script -> node ./scripts/update_data_cuti_billings.js
 *  place or move .CSV to same folder with the scripts
 * *****************************************************
 */

const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({
  path: './.env'
});

const CutiBillingsModel = require('../graphql/cuti_billings/cuti_billings.model');
const instansiModel = require('../graphql/instansi/instansi.model');
const settingModel = require('../graphql/setting/setting.model');
const UserModel = require('../graphql/users/user.model');

const runningScript = async () => {
  console.time('update cuti billings RUN');
  const startTime = moment().format('DD/MM/YYYY HH:mm');
  let countCutiBilUpdated = 0

  let getAllInstansi = await instansiModel.find({
    status: 'active'
  });

  if (getAllInstansi && getAllInstansi.length) {
    for (const instansi of getAllInstansi) {

      let query = {
        instansi_id: instansi._id,
        status: 'active'
      }

      const setting = await settingModel.findOne(query).lean()
      const jumlahUser = await UserModel.count(query)
      let limit = 100
      let skip = 0

      const loopingTotal = Math.ceil(jumlahUser / limit)

      for (let index = 1; index <= loopingTotal; index++) {

        let getUsers = await UserModel.aggregate([{
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

        if (getUsers && getUsers.length) {
          for (const getUser of getUsers) {
            let sisaCuti = 0;
            if (setting && setting.pengaturan_cuti && setting.pengaturan_cuti.quota_cuti) {
              sisaCuti = setting.pengaturan_cuti.quota_cuti;
            }

            let addCutiBillings = await CutiBillingsModel.create({
              user_id: getUser._id,
              tahun: moment().format('yyyy'),
              sisa_cuti: sisaCuti,
              taken_annually: 0,
              taken_not_annually: 0,
              total_taken: 0,
              carried_cuti: 0,
              exp_cuti: 0,
              instansi_id: getUser.instansi_id,
              status: 'active'
            })

            if (addCutiBillings) {
              countCutiBilUpdated++
            }
          }
        }

      }
    }
  }

  console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
  console.log(`UPDATED ${countCutiBilUpdated} cuti billings`)
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