/**
 * ***************************************************
 * to run the script -> node ./scripts/update_divisi_working_time.js
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
const SettingModel = require('../graphql/setting/setting.model');

const runningScript = async () => {
    console.time('update_nama_divisi RUN');
    const startTime = moment().format('DD/MM/YYYY HH:mm');
    let query = {
        status: 'active'
    }
    let updatedDivisi = 0;
    const getAllSetting = await SettingModel.find(query)

    for (const setting of getAllSetting) {
        let setWorkTime = []
        if (setting.set_work_time && setting.set_work_time.length) {
            setWorkTime = setting.set_work_time;
        }

        if (setWorkTime && setWorkTime.length) {
            for (let workTime of setWorkTime) {

                let findDivisi = await DivisiModel.findOne({
                    _id: workTime.divisi_id
                }).lean();
                if (findDivisi) {
                    delete workTime.divisi_id;
                    delete workTime._id;
                    
                    let updateDivisi = await DivisiModel.updateOne({
                        _id: findDivisi._id
                    }, {
                        $set: {
                            checkin_place: workTime.checkin_place ,
                            checkout_place: workTime.checkout_place ,
                            jam_masuk: workTime.jam_masuk ,
                            jam_pulang: workTime.jam_pulang ,
                        }
                    });

                    if (updateDivisi) {
                        updatedDivisi++
                    }
                }
            }
        }

    }

    console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
    console.log(`UPDATED ${updatedDivisi} divisi`)
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