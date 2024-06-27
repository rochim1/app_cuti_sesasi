const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const kategoriCutiSchema = new Schema({
  nama_kategori_cuti: { type: String },
  user_created: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tipe: {
    type: String,
    enum: ['burned_annually', 'accumulate_annually'],
    default: 'burned_annually'
  },
  effective_date: { type: String },
  exp_date: { type: String },
  
  jumlah_kuota_hari: { type: Number }, // per user
  sugested_day_off: { type: Number }, 
  allow_half_day: { type: Boolean },
  keterangan: { type: String },
  need_upload_file: { type: Boolean, default: false},
  allow_min_gap: { type: Boolean},
  min_gap_before_cuti: { type: Number},
  delegated_to_all: { type: Boolean},
  selected_delegated: [{ 
    type: String,
    enum: ['permanent', 'contract', 'probation', 'apprenticeship'],
    default: 'all'
  }],
  selected_users: [{
    type: Schema.Types.ObjectId,
    ref: "user",
  }],
  status: {
    type: String,
    enum: [ 'active', 'inactive', 'deleted' ],
    default: 'active'
  },
  allow_exceed_annually: {
    type: Boolean,
    default: false
  },
  deleted_at: { type: String }
}, {
  timestamps: true
})

module.exports = mongoose.model('kategori_cuti', kategoriCutiSchema)