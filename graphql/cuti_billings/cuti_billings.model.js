const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const cutiBillings = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tahun: String,
  sisa_cuti: Number,
  taken_annually: Number, // berbayar
  taken_not_annually: Number, // tidak berbayar
  total_taken: Number,
  carried_cuti: Number,
  exp_cuti: Number,
  edit_log: [
    {
      tanggal_edit: String,
      user_editor: {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
      tipe: {
        type: String,
        enum: ['pengurangan', 'penambahan']
      },
      number: Number,
      balance: Number
    }
  ],
  status: {
    type: String,
    enum: [ 'active', 'inactive', 'deleted' ],
    default: 'active'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('cuti_billing', cutiBillings)