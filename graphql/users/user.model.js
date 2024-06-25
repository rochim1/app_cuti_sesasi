const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const userSchema = new Schema({
  user_code: String,
  no_identitas: {
    type: String,
  },
  name: {
    type: String,
    required: [true, "Nama wajib disertakan"],
    minLength: [3, "min length is 3"],
    trim: false,
  },
  username: {
    type: String,
    required: [true, "Username wajib disertakan"],
    minLength: [3, "min length is 3"],
    trim: false,
    unique: [true, "username already used"]
  },
  gender: {
    type: String,
    enum: ["m", "f"],
  },
  email: {
    type: String,
    required: [true, "Email wajib disertakan"],
    validate: {
      validator: function (v) {
        return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(v);
      },
      message: (props) => `${props.value} bukan email valid!`,
    },
    unique: [true, "Email sudah digunakan"],
  },
  password: {
    type: String,
    required: [true, "Password wajib disertakan"],
    minLength: [8, "min length is 3"],
  },
  remember_token: {
    type: String,
  },
  identity_type: {
    type: Schema.Types.ObjectId,
    ref: "identity",
  },
  address: {
    type: String,
  },
  domisili: {
    type: String,
  },
  pos_code: {
    type: String,
  },
  url_foto: {
    type: String,
  },
  place_of_birth: {
    type: String
  },
  date_of_birth: {
    type: String,
  },
  telp_number: {
    type: String,
  },
  instansi_id: {
    type: Schema.Types.ObjectId,
    ref: "instansi",
  },
  manager_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  date_join: {
    type: String,
  },
  date_resign: {
    type: String,
  },
  additional_contact: [{
    name: String,
    relation: String,
    telpon_number: String,
    address: String,
    email: String
  }],
  is_admin: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'resign'],
    default: 'active'
  },
  employ_status: {
    type: String,
    enum: [ 'permanent', 'contract', 'probation', 'apprenticeship' ],
    default: 'permanent'
  },
  deleted_reason: {
    type: String
  },
  resign_reason: {
    type: String
  },
  mac_address: {
    type: String
  },
  status_histories: [{
    status: String,
    date_join: String,
    date_resign: String,
    update_status_to: String,
    updated_date: String,
    updated_time: String,
    reason: String,
    user_who_updated: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  }],
  is_presensi_today: {
    type: Boolean,
    default: false
  },
  is_cuti: {
    type: Boolean,
    default: false
  },
  sisa_cuti: {
    type: Number,
    default: 12
  },
  inventaris_kendaraan_id: {
    type: Schema.Types.ObjectId,
    ref: 'cycle'
  },
  kecamatan: {
    type: String,
  },
  kabupaten: {
    type: String
  },
  kelurahan: {
    type: String
  },
  provinsi: {
    type: String
  },
  pendidikan: {
    type: String,
    enum: ["SD/MI", "SMP/MTS", "SMA/SMK/MA", "S1", "S2", "S3"]
  },
  pendidikan_terakhir: {
    type: String
  },
  jurusan: {
    type: String
  },
  status_menikah: {
    type: String,
    enum: ["belum_kawin", "kawin", "cerai_hidup", "cerai_mati"]
  },
  change_tkn: {
    type: String
  },
  device_tkn: {
    type: String
  },
  temp_psw: {
    type: String
  },
  allow_change_pw_after: {
    type: String
  },
  need_logout: {
    type: Boolean
  },
  date_request_change_pw: [{
    //untuk preventiv user tidak dapat update password dalam sehari lebih dari tiga kali
    type: String
  }],
  password_history: [{
   updated_date: { type: String },
   changed_password: { type: String } 
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model("user", userSchema);