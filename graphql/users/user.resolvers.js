const {
  GraphQLError
} = require("graphql");
const userModel = require("./user.model");
const nodemailer = require("nodemailer");
const {
  hash,
  compare
} = require("bcrypt");
const UserUtilities = require("./user.utilities");
const jwt = require("jsonwebtoken");
const {
  validateEmail
} = require("filter-validate-email");
const moment = require("moment");
const common = require("../../utils/common");
const handlebars = require('handlebars');
const fs = require('fs');
const _ = require("lodash")
const translationJSON = require("../../utils/translate/translationJSON.json");
const { CutiBillingsModel } = require("../cuti_billings");

const CreateUserByAdmin = async (parent, {
  input,
  foto
}, ctx) => {
  
};

const CreateUser = async (parent, {
  input
}, ctx) => {
  
};

const Login = async (parent, {
  input
}, ctx) => {
};

const GetOneUser = async (parent, {
  _id
}, ctx) => {
};

const DeleteUser = async (parent, {
  _id,
  reason,
  is_resign
}, ctx) => {

  let updateObject = {
    status: is_resign ? "resign" : "deleted",
    date_resign: is_resign ? moment().format("YYYY-MM-DD") : "",
  }

  if (is_resign) {
    updateObject = {
      ...updateObject,
      resign_reason: reason
    }
  } else {
    updateObject = {
      ...updateObject,
      delete_reason: reason
    }
  }

  // before update need save to history
  const user = await userModel.findById({
    _id
  }).lean()
  const recentDate = moment()
  const deleteUser = await userModel.updateOne({
    _id: _id,
    $or: [{
      status: 'active'
    }, {
      status: 'resign'
    }]
  }, {
    $set: updateObject,
    $push: {
      status_histories: {
        status: user.status,
        date_join: user.date_join,
        date_resign: user.date_resign,
        update_status_to: updateObject.status,
        updated_date: recentDate.format('DD-MM-YYYY'),
        updated_time: recentDate.format('HH:mm:ss'),
        user_who_updated: ctx.user._id,
        reason: user.status && user.status == "resign" ? user.resign_reason : "-"
      }
    }
  });

  if (updateObject.status == 'deleted') {
    await UserTypeModel.updateOne({
      _id: user.user_type_id
    }, {
      status: updateObject.status
    })
  }

  if (deleteUser && deleteUser.inventaris_kendaraan_id) {
    await inventarisModel.findOneAndUpdate({
      _id: deleteUser.inventaris_kendaraan_id
    }, {
      $set: {
        user_id: null
      }
    });
  }

  if (deleteUser && deleteUser.modifiedCount > 0) {
    return {
      is_successed: true,
      message: `userid ${_id} berhasil dihapus`
    };
  }

  throw new GraphQLError(`userid ${_id} tidak berhasil dihapus`, {
    extensions: {
      code: "BAD_REQUEST",
      http: {
        status: 400
      }
    },
  });
};

const Logout = async (parent, args, ctx) => {
  const logoutUser = await userModel.findOneAndUpdate({
    _id: ctx.user._id,
    status: "active"
  }, {
    $set: {
      remember_token: "",
      mac_address: "",
    }
  });

  if (logoutUser) {
    
    return {
      is_successed: true,
      message: `Berhasil logout`
    };
  }

  throw new GraphQLError(`Gagal logout`, {
    extensions: {
      code: "BAD_REQUEST",
      http: {
        status: 400
      }
    },
  });
};

const UploadImage = async (parent, {
  file
}, ctx) => {
  const {
    createReadStream,
    filename,
    mimetype,
    encoding
  } = await file;
  const filePath = `./static/${filename}`;
  const writeFile = await common.writeFile(createReadStream(), filePath);

  if (writeFile) {
    const data = await UserUtilities.saveImage(filePath);

    await userModel.updateOne({
      email: ctx.user.email,
      status: "active",
    }, {
      $set: {
        url_foto: data && data.base64File ? await common.resizeBase64({
          base64Image: data.base64File
        }) : "",
      },
    });

    await UserUtilities.deleteImages(filePath);

    return {
      filename,
      mimetype,
      encoding,
      bufferFile: data && data.extension ? data.extension : "",
    };
  } else {
    throw new GraphQLError("Gagal upload file", {
      extensions: {
        code: "REQUEST_TIMEOUT",
        http: {
          status: 408
        }
      },
    });
  }
};

const GetProfileImage = async (parent, {
  _id
}, ctx) => {
  const userId = _id ? _id : ctx.user._id;

  let getUserImage = await userModel.findOne({
    _id: userId,
    status: {
      $nin: ["deleted"]
    }
  }).select({
    url_foto: 1
  })

  return {
    url_foto: getUserImage.url_foto
  }
};

const checkUserByEmail = async (parent, {
  emailOrUsername
}, ctx) => {
  let user = await userModel.findOne({
    $or: [{
        username: emailOrUsername
      },
      {
        email: emailOrUsername
      }
    ],
    status: "active"
  });

  // masking the email
  if (user && user.email) {
    user.email = UserUtilities.maskingEmail(user.email)
  }
  return user
}

const RequestChangePassword = async (parent, {
  _id,
  email,
  is_web,
  new_password
}, ctx) => {

  let findObject = {
    email: email,
    status: "active"
  }
  findObject = _id ? {
    _id: _id
  } : findObject

  let user = await userModel.findOne(findObject);


  if (!user) {
    throw new GraphQLError("email tidak ditemukan", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400
        }
      },
    });
  }

  email = email ? email : user.email
  let token = UserUtilities.GenerateCode(5);
  await userModel.updateOne({
    email: email,
    status: "actove"
  }, {
    $set: {
      change_tkn: token,
      device_tkn: is_web ? 'web' : 'mobile',
      temp_psw: await hash(new_password, 10)
    },
  });

  let transporter = await nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD_SENDER,
    },
  });

  let mailOptions = {
    from: '"Zera Presensi - Ubah Password" <' + process.env.EMAIL_SENDER + ">",
    to: email,
    subject: "Token aktivasi Ubah Password",
    html: `
        <table style="border-collapse: collapse;width: 100%;">
        <tr>
          <th style="text-align: center; padding: 8px;background-color: #04AA6D;color: white;">Zera Presensi System</th>
        </tr>
        <tr>
          <td style="text-align: justify; padding: 8px;">
            Terimakasih telah bergabung dengan sistem Zera Presensi, kami menanggapi permintaan anda mengubah kata sandi. 
            Proses berikutnya pengubahan kata sandi melalui link yang kami lampirkan </br>

            </br>
            <a href='https://presensi.zensemitraraya.com/reset-password?token=${token}$device=${is_web ? 'web' : 'mobile'}' style="padding: 10px 0;">Saya menyetujui</a>
          </td>
        </tr>
      </table>
    `
  };

  try {
    let sendmail = transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log("err:", error);
        return false
      }

      return true
    });

    email = UserUtilities.maskingEmail(email)
    return {
      message: `Email terkirim ke ${email}`
    }
  } catch (error) {
    console.log(error)
    throw new GraphQLError("Email tidak terkirim", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400
        }
      },
    });
  }
};

const RequestChangePasswordWeb = async (parent, {
  _id
}, ctx) => {

  let findObject = {
    _id: _id,
    status: "active",
  };
  let user = await userModel.findOne(findObject);
  if (!user) {
    throw new GraphQLError("user tidak ditemukan", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400,
        },
      },
    });
  }

  //validasi
  const validasi = await UserUtilities.validasiChangePassword(user);
  if (!validasi) {
    user = await userModel.findOne(findObject);
    throw new GraphQLError(
      "anda meminta ubah password 3 kali berturut-turut selama 3 jam terakhir, update lagi setelah " +
      moment(user.allow_change_pw_after).format("DD/MM/YYYY HH:mm:ss"), {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 400,
          },
        },
      }
    );
  }

  const currentDate = moment();

  let email = user.email;
  const expirationTime = "10m"
  let token = UserUtilities.generateToken(user, expirationTime);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD_SENDER,
    },
  });

  const templatePath = "./utils/email/templates/REQ_CHANGE_PW.html";
  const templateContent = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateContent);

  let requireParams = {
    name: user.name,
    telpon: "082154441119",
    landingPage: "https://presensi.zensemitraraya.com/",
    link: "https://presensi.zensemitraraya.com/ubah-password?token=" + token,
    batasWaktu: moment().add(10, 'minutes').format('DD-MM-YYY HH:mm:ss')
  };
  mailOptions = {
    from: '"Zera Presensi - Ubah Password" <' + process.env.EMAIL_SENDER + ">",
    to: email,
    subject: "Ubah Password Akun Zera Presensi",
    html: template(requireParams),
  };

  try {
    let sendmail = transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log("err:", error);
        return false;
      }

      return true;
    });

    await userModel.updateOne({
      _id: user._id
    }, {
      $push: {
        date_request_change_pw: currentDate.format(),
      },
    });
    email = UserUtilities.maskingEmail(email);
    return {
      message: `Email terkirim ke ${email}`
    };
  } catch (error) {
    console.log(error);
    throw new GraphQLError("Email tidak terkirim", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400,
        },
      },
    });
  }
};

const GetAllUser = async (parent, {
  filter,
  sorting,
  pagination
}, ctx) => {
  let aggregateQuery = [];
  let aggregateFilter = {
    status: filter && filter.status ? filter.status : "active",
    instansi_id: ctx.user.instansi_id
  };
  let sortingQuery = {
    createdAt: -1
  };
  let aggregateAnd = {
    $and: []
  };

  if (filter) {
    if (filter._ids) {
      aggregateFilter = {
        ...aggregateFilter,
        _id: {
          $in: filter._ids.map(val => new ObjectId(val))
        } 
      }
    }

    if (filter.name) {
      aggregateAnd.$and.push({
        $or: [{
            username: common.createDiacriticSensitiveRegex(filter.name)
          },
          {
            name: common.createDiacriticSensitiveRegex(filter.name)
          }
        ]
      });
    }

    if (filter.tipe) {
      aggregateFilter.employ_status = filter.tipe
    }

    if (filter.gender) {
      aggregateFilter.gender = filter.gender
    }

  }

  if (sorting) {
    if (sorting.username) {
      sortingQuery = {
        username: sorting.username == "asc" ? 1 : -1
      }
    } else if (sorting.name) {
      sortingQuery = {
        name: sorting.name == "asc" ? 1 : -1
      }
    }
  }
  if (aggregateAnd && aggregateAnd.$and && aggregateAnd.$and.length) {
    aggregateFilter = {
      ...aggregateFilter,
      ...aggregateAnd
    }
  }

  aggregateQuery.push({
    $match: aggregateFilter
  },  
  {
    $sort: sortingQuery
  });

  // karena foto disimpan di database ini perlu di tambahkan untuk kecepatan get data
  aggregateQuery.push({
    $project: {
      url_foto: 0
    }
  });

  let paginationQuery = [];
  if (pagination) {
    let skip = pagination.limit * pagination.page;
    paginationQuery.push({
      $skip: skip,
    }, {
      $limit: pagination.limit,
    });
  }

  aggregateQuery.push({
    $facet: {
      users: paginationQuery,
      info_page: [{
        $group: {
          _id: null,
          count: {
            $sum: 1
          }
        },
      }, ],
    },
  });
  
  const data = await userModel.aggregate(aggregateQuery).collation({
    locale: "id"
  }).allowDiskUse(true);

  return data[0];
};

const ImportUser = async (parent, {
  file
}, ctx) => {
  const {
    filename,
    createReadStream
  } = await file;
  if (filename) {
    const checkExtention = filename.match(".csv");
    if (!checkExtention)
      throw new GraphQLError("File harus berekstensi csv", {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 400
          }
        },
      });
  }
  const stream = await UserUtilities.ReadStreamCSV(createReadStream());
  if (!stream)
    throw new GraphQLError("Importing gagal", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400
        }
      },
    });

  let progressImport = await UserUtilities.progressOfImport(
    stream.filter((val) => val.email !== undefined),
    ctx.user.instansi_id
  );

  if (progressImport) {
    progressImport = progressImport.filter(
      (v, i, a) => a.findIndex((v2) => v2.email === v.email) === i
    );
  }

  return await userModel.create(progressImport);
};

async function exportUsers(parent, {
  input
}) {
  // import module
  const today = moment().format('DD-MM-YYYY');

  let delimiter;
  let queryFind = {};

  // ***** cek input parameter
  if (input) {
    // ***** user ids
    if (input.user_ids) {
      queryFind = {
        _id: {
          $in: input.user_ids
        },
      };
    } else {
      // ***** find all jika tidak passing user_ids
      queryFind = {};
    }

    if (input.delimiter === 'comma') {
      delimiter = ',';
    } else if (input.delimiter === 'semicolon') {
      delimiter = ';';
    } else if (input.delimiter === 'tab') {
      delimiter = ' ';
    } else {
      // ***** default delimiter
      delimiter = ',';
    }
  } else {
    throw new GraphQLError(
      `Input tidak boleh kosong`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400
          }
        }
      }
    );
  }

  let users = await userModel
    .find(queryFind)
    .populate([{
      path: 'identity_type'
    }, {
      path: 'user_type_id',
      populate: {
        path: 'divisi_id'
      }
    }])
    .lean();

  const csvName = `export-user-${today}.csv`;
  const pathCsv = `./files/${csvName}`;

  let recordsCsvString = [];
  let index = 1;

  // ***** loop per user
  for (const eachUser of users) {
    let umurUser;
    let lamaUser;

    // ***** menentukan umur user
    if (eachUser && eachUser.date_of_birth) {
      const today = moment(new Date());
      const date_of_birth = moment(eachUser.date_of_birth);
      umurUser = moment.duration(today.diff(date_of_birth)).years(date_of_birth) + ' tahun';
    }

    // ***** menentukan lama bergabungnya user
    let endDateTemp;
    if (eachUser && !eachUser.date_resign) {
      endDateTemp = moment();
    } else if (eachUser && eachUser.date_resign) {
      endDateTemp = moment(eachUser.date_resign);;
    }

    // ***** skip kalo ga ada date join
    if (!eachUser.date_join) {
      continue;
    }

    const startDate = moment(eachUser.date_join);
    const endDate = endDateTemp;
    const duration = moment.duration(endDate.diff(startDate));
    const yearsDiff = duration.years();
    const monthsDiff = duration.months();
    const dayDiff = duration.days();
    lamaUser = `${yearsDiff} tahun ${monthsDiff} bulan ${dayDiff} hari`;

    // ***** divisi dari user
    let divisiUser;
    if (eachUser.user_type_id && eachUser.user_type_id.divisi_id && eachUser.user_type_id.divisi_id.nama_divisi) {
      divisiUser = translationJSON.divisi.ind[eachUser.user_type_id.divisi_id.nama_divisi.toUpperCase()];
    }

    let userTipe;
    if (eachUser.employ_status) {
      userTipe = translationJSON.user_type.ind[eachUser.employ_status.toUpperCase()];
    }
    
    
    // records to csv string
    recordsCsvString.push({
      no: index,
      username: eachUser.username,
      nama: eachUser.name,
      status: eachUser.status,
      identitas: eachUser.identity_type ? eachUser.identity_type.nama_identitas.toUpperCase() : '-',
      no_identitas: eachUser.no_identitas ? `${eachUser.no_identitas}` : '-',
      tipe: userTipe ? userTipe : '',
      divisi: divisiUser ? divisiUser : '',
      jabatan: eachUser.user_type_id && eachUser.user_type_id.jabatan ?
        eachUser.user_type_id.jabatan : "-",
      level: eachUser.user_type_id && eachUser.user_type_id.level ?
        eachUser.user_type_id.level : "-",
      jk: eachUser.gender === 'm' ? 'Laki-Laki' : 'Perempuan',
      telepon: eachUser.telp_number ? eachUser.telp_number : '-',
      email: eachUser.email ? eachUser.email : '-',
      lahir: eachUser.date_of_birth ? moment(eachUser.date_of_birth).format('DD/MM/YYYY') : '-',
      umur: umurUser ? umurUser : '',
      bergabung: eachUser.date_join ? moment(eachUser.date_join).format('DD/MM/YYYY') : '-',
      berakhir: eachUser.date_resign ? moment(eachUser.date_resign).format('DD/MM/YYYY') : '-',
      lama: lamaUser ? lamaUser : ''
    })
    index++;
  }

  const headers = [
    [
      'No',
      'Username',
      'Nama',
      'Status',
      'Identitas',
      'No Identitas',
      'tipe',
      'Divisi',
      'Jabatan',
      'Level',
      'Jenis Kelamin',
      'Telepon',
      'Email',
      'Lahir',
      'Umur',
      'Bergabung',
      'Berakhir',
      'Lama'
    ],
  ];

  const result = common.convertToCsv(recordsCsvString, headers, delimiter);
  return {
    name: csvName,
    data: result
  };
  // if want to save in folder
  fs.writeFileSync(pathCsv, csvData, 'utf-8');
}

async function GetGenderDiversity(parent, {
  filter
}, ctx) {
  const instansiId = new ObjectId(ctx.user.instansi_id)
  const result = await userModel.aggregate([
    {
      $match: {
        instansi_id: instansiId,
        status: filter && filter.status_user ? filter.status_user : 'active'
      }
    },
    {
      $group: {
        _id: null,
        total_men: {
          $sum: {
            $cond: [{ $eq: ['$gender', 'm'] }, 1, 0]
          }
        },
        total_women: {
          $sum: {
            $cond: [{ $eq: ['$gender', 'f'] }, 1, 0]
          }
        },
        total_gender_undefined: {
          $sum: {
            $cond: [{ $eq: [{ $ifNull: ['$gender', null] }, null] }, 1, 0]
          }
        }
      }
    }
  ]).collation({
    locale: "id"
  }).allowDiskUse(true);
  
  return result[0];
}

async function GetEmployDiversity(parent, {
  filter
}, ctx) {
  const instansiId = new ObjectId(ctx.user.instansi_id)
  const result = await userModel.aggregate([
    {
      $match: {
        instansi_id: instansiId,
        status: filter && filter.status_user ? filter.status_user : 'active'
      }
    },
    {
      $group: {
        _id: null,
        total_permanen: {
          $sum: {
            $cond: [{ $eq: ['$employ_status', 'permanent'] }, 1, 0]
          }
        },
        total_kontrak: {
          $sum: {
            $cond: [{ $eq: ['$employ_status', 'contract'] }, 1, 0]
          }
        },
        total_percobaan: {
          $sum: {
            $cond: [{ $eq: ['$employ_status', 'probation'] }, 1, 0]
          }
        },
        total_magang: {
          $sum: {
            $cond: [{ $eq: ['$employ_status', 'apprenticeship'] }, 1, 0]
          }
        }
      }
    }
  ]).collation({
    locale: "id"
  }).allowDiskUse(true);
  
  return result[0];
}


module.exports = {
  Query: {
    GetOneUser,
    GetAllUser,
    GetProfileImage,
    GetGenderDiversity,
    GetEmployDiversity
  },
  Mutation: {
    CreateUserByAdmin,
    CreateUser,
    Login,
    DeleteUser,
    Logout,
    RequestChangePassword,
    RequestChangePasswordWeb,
    UploadImage,
    ImportUser,
    exportUsers,
    checkUserByEmail
  },
};