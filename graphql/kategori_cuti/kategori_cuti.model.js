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
  allow_exceed: { type: Boolean },
  number_of_exceed: { type: Number },
  keterangan: { type: String },
  delegated_to_all: { type: Boolean},
  need_upload_file: { type: Boolean, default: false},
  allow_min_gap: { type: Boolean},
  min_gap_before_cuti: { type: Number},
  selected_delegated: [{ 
    type: String,
    enum: ['permanent', 'contract', 'probation', 'apprenticeship'],
    default: 'all'
  }],
  delegated_to_all_divisi: { type: Boolean},
  selected_delegated_divisi : [{
    type: Schema.Types.ObjectId,
    ref: "divisi",
  }],
  selected_users: [{
    type: Schema.Types.ObjectId,
    ref: "user",
  }],
  instansi_id: {
    type: Schema.Types.ObjectId,
    ref: "instansi",
  },
  status: {
    type: String,
    enum: [ 'active', 'inactive', 'deleted' ],
    default: 'active'
  },
  is_special: { type: Boolean },
  deleted_at: { type: String }
}, {
  timestamps: true
})

module.exports = mongoose.model('Kategori_cuti', kategoriCutiSchema)