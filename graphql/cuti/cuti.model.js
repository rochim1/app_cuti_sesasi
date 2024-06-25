const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const cutiSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tipe_cuti: {
    type: String
  },
  alasan: {
    type: String,
    default: ''
  },
  tanggal_pengajuan: {
    type: String,
    default: ''
  },
  status_izin: {
    type: String,
    enum: ['diterima', 'ditolak', 'diajukan']
  },
  filename: {
    type: String
  },
  tanggal_aksi: {
    type: String,
    default: ''
  },
  aktor_aksi: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  instansi_id: {
    type: Schema.Types.ObjectId,
    ref: "instansi",
  },
  is_response_by_admin: {
    type: Boolean,
    default: false
  },
  tanggal_izin: {
    type: String,
    default: ''
  },
  tanggal_masuk: {
    type: String,
    default: ''
  },
  file_izin: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  },
  deleted_at: { type: String }
}, {
  timestamps: true
})

module.exports = mongoose.model('cuti', cutiSchema)