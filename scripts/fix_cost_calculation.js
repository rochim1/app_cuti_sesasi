/**
 * ***************************************************
 * to run the script -> node ./scripts/fix_cost_calculation.js
 *  place or move .CSV to same folder with the scripts
 * *****************************************************
 */

const moment = require('moment');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './.env' });

const TaskModel = require('../graphql/tasks/task.model');

const runningScript = async () => {
  console.time('fix cost calculation RUN');
  const startTime = moment().format('DD/MM/YYYY HH:mm');
  const jumlahTask = await TaskModel.count({ aktivitas: { $ne: []}})
  let limit = 100
  let skip = 0
  let countTaskUpdated = 0

  const loopingTotal = Math.ceil(jumlahTask/limit)
  console.log(jumlahTask)
  console.log(loopingTotal)
  for (let index = 1; index <= loopingTotal; index++) {

    let taskData = await TaskModel.aggregate([
      {
        $match: {
          aktivias: {
            $nin: []
          }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]).collation({ locale: 'id' }).allowDiskUse(true);
  
    if (taskData && taskData.length) {
      for (const task of taskData) {
        console.log(task._id)
        if (task.aktivitas && task.aktivitas.length) {
          let withoutCancle = {
            biaya_actually: 0,
            count_jarak_from_attendance: 0,
            total_waktu_tempuh: 0,
            total_waktu_gmaps: 0,
          }
          let newCounter = {...withoutCancle}
          task.aktivitas.map(val => {
            newCounter.biaya_actually += +val.estimasi_biaya_per_task
            newCounter.count_jarak_from_attendance += +val.distance_from_attendance
            newCounter.total_waktu_tempuh += +val.estimasi_waktu_tempuh 
            newCounter.total_waktu_gmaps += +val.estimasi_waktu_gmaps
            
            if (!['cancle', 'cancle_by_system'].includes(val.status_task)) {
              withoutCancle.biaya_actually += +val.estimasi_biaya_per_task
              withoutCancle.count_jarak_from_attendance += +val.distance_from_attendance
              withoutCancle.total_waktu_tempuh += +val.estimasi_waktu_tempuh
              withoutCancle.total_waktu_gmaps += +val.estimasi_waktu_gmaps
            }
          })
          
          task.calc_without_cancled_task = withoutCancle
          
          const updatedTask = await TaskModel.updateOne({ _id: task._id}, {
            $set: {
              ...task,
              ...newCounter
            }
          })

          if (updatedTask) {
            countTaskUpdated ++
          }
        }
      }
    }
    
    skip = limit * index;
  }

  console.log(`Start: ${startTime}, End: ${moment().format('DD/MM/YYYY HH:mm')}`);
  console.log(`UPDATED ${countTaskUpdated} tasks`)
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
