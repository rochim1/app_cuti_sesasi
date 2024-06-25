const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const cutiBillings = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tahun: String,
  sisa_cuti: Number,
  taken_annually: Number,
  taken_not_annually: Number,
  total_taken: Number,
  carried_cuti: Number,
  exp_cuti: Number,
  instansi_id: {
    type: Schema.Types.ObjectId,
    ref: "instansi",
  },
  status: {
    type: String,
    enum: [ 'active', 'inactive', 'deleted' ],
    default: 'active'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('cuti_billing', cutiBillings)