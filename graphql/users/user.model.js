const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const userSchema = new Schema({
  user_code: String,
  username: {
    type: String,
    required: [true, "Username wajib disertakan"],
    minLength: [3, "min length is 3"],
    trim: false,
    unique: [true, "username already used"]
  },
  name: {
    type: String,
    required: [true, "Nama wajib disertakan"],
    minLength: [3, "min length is 3"],
    trim: false,
  },
  tipe_identitas: {
    type: String,
    enum: ["ktp", "sim", "pasport"],
  },
  no_identitas: {
    type: String,
  },
  role: {
    type: String,
    required: [true, "Role wajib disertakan"],
    enum: ["admin", "verifikator", "ordinary"],
    default: "ordinary"
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
  is_cuti: {
    type: Boolean,
    default: false
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
  date_request_change_pw: [{
    //untuk preventif user tidak dapat update password dalam sehari lebih dari tiga kali
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