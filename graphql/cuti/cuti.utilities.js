const moment = require('moment');
const UserModel = require('../users/user.model');
const cron = require("node-cron");

const dateRange = async (startDate, endDate, steps = 1) => {
    const dateArray = [];
    let currentDate = moment(startDate, 'YYYY-MM-DD');
    let endDates = moment(endDate, 'YYYY-MM-DD');
  
    while (currentDate <= endDates) {
      dateArray.push(currentDate.format('YYYY-MM-DD'));
      // Use UTC date to prevent problems with time zones and DST
      currentDate.add(steps, 'days');
    }
  
    return dateArray;
}

const triggerCronIzin = async (cuti, status, total_cuti, sisa_cuti) => {
  const waktu_izin = moment(cuti.tanggal_izin, "YYYY-MM-DD");
  const waktu_masuk = moment(cuti.tanggal_masuk, 'YYYY-MM-DD');
  
  const schedule_izin = `${waktu_izin.second()} ${waktu_izin.minute() + 2} ${waktu_izin.hour()} ${waktu_izin.date()} ${waktu_izin.month() + 1} *`;
  const schedule_masuk = `${waktu_masuk.second()} ${waktu_masuk.minute() + 2} ${waktu_masuk.hour()} ${waktu_masuk.date()} ${waktu_masuk.month() + 1} *`;

  const task_izin = cron.schedule(schedule_izin, async () => {
    const update = await UserModel.findOneAndUpdate(
      {
        _id: cuti.user_id,
        status: "active",
      },
      {
        $set: {
          sisa_cuti: sisa_cuti - total_cuti,
          is_cuti: status,
        },
      }
    );

    if (!update) console.log('no data')
    
    console.log(`cronjob berhasil update user ${update._id} untuk izin cuti`);

    task_izin.stop()
  });

  const task_masuk = cron.schedule(schedule_masuk, async () => {
    const update = await UserModel.findOneAndUpdate(
      {
        _id: cuti.user_id,
        status: "active",
      },
      {
        $set: {
          is_cuti: false,
        },
      }
    );

    if (!update) console.log('no data')
    
    console.log(`cronjob berhasil update user ${update._id} untuk masuk kerja`);

    task_masuk.stop()
  });
};

module.exports = {
    dateRange,
    triggerCronIzin
}