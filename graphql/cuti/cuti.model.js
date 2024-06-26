const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const cutiSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tipe_cuti: {
    type: Schema.Types.ObjectId,
    ref: "kategori_cuti",
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
  tanggal_aksi: {
    type: String,
    default: ''
  },
  aktor_aksi: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  tanggal_izin: {
    type: String,
    default: ''
  },
  tanggal_masuk: {
    type: String,
    default: ''
  },
  terhitung_hari: String,
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