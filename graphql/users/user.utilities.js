const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { compareSync, hash, compare } = require("bcrypt");
const moment = require("moment");
const { GraphQLError } = require("graphql");
const UserModel = require("./user.model");
const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { validateEmail } = require("filter-validate-email");

function generateToken(user, expires) {
  expires = expires || "1h";
  let token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: expires,
    }
  );

  return token;
}

const GenerateCode = (code_length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  let randomString = "";
  for (let i = 0; i < code_length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

const remember_me = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const comparePassword = (plaintextPassword, hash) => {
  const result = compareSync(plaintextPassword, hash);
  return result;
};

const saveImage = async (filename, needUploadToFile = false) => {
  try {
    let resultImage = {};
    // readfile after uploaded. the image should exist first
    const fileToBase64 = fs.readFileSync(filename, { encoding: "base64" });

    const ext = path.extname(filename).replace(".", "");
    let base64File;

    if (ext === "pdf") {
      base64File = ext ? `data:application/${ext};base64,${fileToBase64}` : "";
    } else {
      base64File = ext ? `data:image/${ext};base64,${fileToBase64}` : "";
    }

    resultImage.extension = ext;
    resultImage.base64File = base64File;
    // resultImage.changeToBuffer = file;
    return resultImage;
  } catch (error) {
    console.log(error);
    console.log("tidak dapat convert image ke base64");
    throw new GraphQLError(`Ada kesalahan sistem, ${error}`, {
      extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });
  }
};

const deleteImages = async (filename) => {
  try {
    fs.unlinkSync(filename);
    return true;
  } catch (e) {
    return false;
  }
};

const ReadStreamCSV = (createReadStream) => {
  if (!createReadStream) return null;
  return new Promise((resolve, reject) => {
    const headers = [
      "Timestamp",
      "email",
      "name",
      "email_input",
      "no_identitas",
      "identity_type",
      "gender (f/m)",
      "divisi_name",
      "address",
      "domisili",
      "pos_code",
      "date_of_birth",
      "date_join",
    ];
    let listOfData = [];

    const stream = createReadStream;

    stream.on("data", async function (filestream) {
      let arrayData = filestream.toString().split("\n");
      if (arrayData && arrayData.length) {
        arrayData = arrayData.slice(1);
      }

      for (let i = 0; i < arrayData.length; i++) {
        let objectValue = {};
        const comma_split = arrayData[i].split(";");

        headers.forEach((key, index) => {
          objectValue[key] = comma_split[index];
        });

        delete objectValue.Timestamp;

        listOfData.push(objectValue);
      }

      resolve(listOfData);
    });

    stream.on("error", (err) => {
      reject(false);
    });
  });
};

const maskingEmail = (email) => {
  const atIndex = email.indexOf("@");
  const charsToMask = Math.floor(atIndex / 2); // Calculate 50% of characters to mask
  const maskedPart = "*".repeat(charsToMask);
  let visiblePart = charsToMask ? email.slice(0, charsToMask) : "*";
  visiblePart = visiblePart + maskedPart + email.slice(atIndex);

  return visiblePart;
};

/**
 * validasi untuk request change password hanya dapat dilakukan 3x selama 3 jam sekali supaya tidak ada spam
 *
 * @param {*} dateStrings
 * @return {*}
 */
const validasiChangePassword = async (user) => {
  let isAllow = true;
  const dateStrings = user.date_request_change_pw
    ? user.date_request_change_pw
    : [];

  const currentDate = moment();

  // Define a time range for the last 3 hours
  const timeRange = moment.duration(3, "hours");

  // Filter dates within the last 3 hours
  const filteredDates = dateStrings.filter(
    (dateStr) => moment(currentDate).diff(moment(dateStr), "hours") < 3
  );

  const jumlahRequest = filteredDates.length;

  if (user.allow_change_pw_after) {
    const validasiTanggal = moment(user.allow_change_pw_after).isAfter(
      currentDate
    );

    if (validasiTanggal) {
      isAllow = false;
      return isAllow;
    }
  }

  if (jumlahRequest > 3) {
    const batasUpdate = moment().add(3, "hours").format();
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          allow_change_pw_after: batasUpdate,
        },
      }
    );

    isAllow = false;
  }

  return isAllow;
};

const sendNotifSucessUpdatePw = async (user, aktor) => {
  if (!user && !aktor) {
    return false;
  }
  const templatePath = "./utils/email/templates/NOTIF_CHG_PW.html";
  const templateContent = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateContent);

  let requireParams = {
    name: user.name,
    akun: user.username,
    aktor: aktor.username,
    is_admin: aktor.is_admin,
    telpon: "082154441119",
    loginPage: "https://presensi.zensemitraraya.com/login",
  };

  mailOptions = {
    from: '"Zera Presensi - Berhasil Ubah Password"',
    to: user.email,
    subject: "Anda berhasil mengubah password akun zera presensi",
    html: template(requireParams),
  };

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.PASSWORD_SENDER,
    },
  });

  try {
    let sendmail = transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log("err:", error);
        return false;
      }
      return true;
    });
    console.log("email terkirim");
  } catch (error) {
    console.log(error);
  }
};

const createUser = async (input, ctx) => {
  try {
    if (!input) {
      throw new GraphQLError(`masukan input, ${error}`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    if (ctx && ctx.user && ctx.user.role && ctx.user.role == "admin") {
      // if admin add user as verifikator
      input.role = "verifikator";
    } else {
      // if ordinary user the role sholud be ordinary
      input.role = "ordinary";
    }
    input.password =
      input && input.password ? await hash(input.password, 10) : "";
    const user = await UserModel.create(input);

    return user;
  } catch (error) {
    console.log(error);
    throw new GraphQLError(
      `Maaf terjadi kesalahan, hubungi administrator! ${error}`,
      {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      }
    );
  }
};

const getAllUser = async (filter, sorting, pagination, ctx) => {
  try {
    if (!ctx || !ctx.user || (ctx && ctx.user && ctx.user.role !== "admin")) {
      throw new GraphQLError(
        "anda tidak memiliki izin untuk mengakses data users",
        {
          extensions: {
            code: "FORBIDDEN",
            http: {
              status: 403,
            },
          },
        }
      );
    }

    let aggregateQuery = [];

    let aggregateFilter = {
      status: filter && filter.status ? filter.status : "active",
    };
    let sortingQuery = {
      createdAt: -1,
    };
    let aggregateAnd = {
      $and: [],
    };

    if (filter) {
      if (filter._ids) {
        aggregateFilter = {
          ...aggregateFilter,
          _id: {
            $in: filter._ids.map((val) => new ObjectId(val)),
          },
        };
      }

      if (filter.name) {
        aggregateAnd.$and.push({
          $or: [
            {
              username: common.createDiacriticSensitiveRegex(filter.name),
            },
            {
              name: common.createDiacriticSensitiveRegex(filter.name),
            },
          ],
        });
      }

      if (filter.employ_status) {
        aggregateFilter.employ_status = filter.employ_status;
      }

      if (filter.gender) {
        aggregateFilter.gender = filter.gender;
      }
    }

    if (sorting) {
      if (sorting.username) {
        sortingQuery = {
          username: sorting.username == "asc" ? 1 : -1,
        };
      } else if (sorting.name) {
        sortingQuery = {
          name: sorting.name == "asc" ? 1 : -1,
        };
      }
    }

    if (aggregateAnd && aggregateAnd.$and && aggregateAnd.$and.length) {
      aggregateFilter = {
        ...aggregateFilter,
        ...aggregateAnd,
      };
    }

    aggregateQuery.push(
      {
        $match: aggregateFilter,
      },
      {
        $sort: sortingQuery,
      }
    );

    let paginationQuery = [];
    if (pagination) {
      let skip = pagination.limit * pagination.page;
      paginationQuery.push(
        {
          $skip: skip,
        },
        {
          $limit: pagination.limit,
        }
      );
    }

    aggregateQuery.push({
      $facet: {
        data: paginationQuery,
        info_page: [
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
      },
    });

    const data = await UserModel.aggregate(aggregateQuery)
      .collation({
        locale: "id",
      })
      .allowDiskUse(true);

    return data[0];
  } catch (error) {
    throw new GraphQLError(
      `Maaf terjadi kesalahan, hubungi administrator! ${error}`,
      {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      }
    );
  }
};

const editUser = async (id_user, input, ctx) => {
  try {
    if (!id_user) {
      throw new GraphQLError(`id_user diperlukan`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    if (!input) {
      throw new GraphQLError(`masukkan input`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    let findUser = await UserModel.findOne({ _id: id_user, status: "active" });
    if (!findUser) {
      throw new GraphQLError(`user tidak ditemukan`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    let getRoleUpdater = ctx && ctx.user && ctx.user.role ? ctx.user.role : "";
    let prevent_update = false;
    if (input.role) {
      if (getRoleUpdater !== "admin") {
        delete input.role;
        prevent_update = true;
      }

      if (String(ctx.user._id) == String(id_user)) {
        throw new GraphQLError(`anda tidak dapat mengubah role anda sendiri`, {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
            },
          },
        });
      }
    }

    if (input.password) {
      if (getRoleUpdater !== "admin") {
        delete input.password;
        prevent_update = true;
      }
    }

    if (prevent_update) {
      throw new GraphQLError(
        `anda tidak dapat mengupdate password user, anda bukan admin`,
        {
          extensions: {
            code: "FORBIDEN",
            http: {
              status: 400,
            },
          },
        }
      );
    }
    
    let updateUser = await UserModel.findOneAndUpdate(
      { _id: id_user, status: "active" },
      { $set: input },
      { new: true }
    );

    return updateUser;
  } catch (error) {
    throw new GraphQLError(`Error! ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const login = async (input) => {
  try {
    if (!input) {
      throw new GraphQLError(`masukan input, ${error}`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    let is_email;
    if (input && input.email_or_username) {
      is_email = validateEmail(input.email_or_username);
    } else {
      throw new GraphQLError(`masukan input username/email`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    if (!input.password) {
      throw new GraphQLError(`masukan input password`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    let user;

    if (input && input.remember_token) {
      // this is remember me model laravel (actually it's not used)
      user = await UserModel.findOne({
        remember_token: input.remember_token,
      });

      // ********* if user login with remember token, but the user is not found
      if (!user && input.remember_token) {
        // note remember token is jwt token
        const verification = jwt.verify(
          input.remember_token,
          process.env.TOKEN_SECRET,
          (err, res) => {
            if (err) console.log(err);
            return res;
          }
        );
        if (verification) {
          user = await UserModel.findOne({
            email: verification.email,
            status: "active",
          });
        } else {
          throw new GraphQLError("Authorisasi gagal, session telah berakhir", {
            extensions: {
              code: "FORBIDDEN",
              http: {
                status: 403,
              },
            },
          });
        }
      }
    }

    if (!user) {
      let findQuery = {};
      if (is_email) {
        findQuery = {
          email: input.email_or_username,
          status: "active",
        };
      } else {
        findQuery = {
          username: input.email_or_username,
          status: "active",
        };
      }

      user = await UserModel.findOne(findQuery);
    }

    //   if user still not found
    if (!user) {
      throw new GraphQLError(
        "Autentikasi gagal, pengguna tidak dapat ditemukan",
        {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        }
      );
    }

    if (input && input.password) {
      const verifyPassword = await compare(input.password, user.password);
      let passwordInfo;
      if (!verifyPassword) {
        // if user input exp password return info about that
        if (user && user.password_history && user.password_history.length) {
          for (const historyPw of user.password_history) {
            const isMatch = await compare(
              input.password,
              historyPw.changed_password
            );
            if (isMatch) {
              passwordInfo = historyPw;
              break;
            }
          }
        }

        const message = passwordInfo
          ? `Password tersebut telah diubah sejak ${
              passwordInfo.updated_date
                ? moment(passwordInfo.updated_date).format("DD/MM/YYYY")
                : ""
            }`
          : "Autentikasi gagal, password salah";
        throw new GraphQLError(message, {
          extensions: {
            code: "FORBIDDEN",
            http: {
              status: 403,
            },
          },
        });
      }
    }

    let token;
    if (input && input.remember_me) {
      // generate remember token and save to user. without no limit life (actually its dangerous if hacker know the token)
      let token_remember_me = jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        process.env.TOKEN_SECRET
      );

      await UserModel.updateOne(
        {
          _id: user._id,
          status: "active",
        },
        {
          $set: {
            remember_token: String(token),
          },
        }
      );
      token = token_remember_me;
    } else {
      // if user not request to remember he/she generate token with limit 1h
      token = generateToken(user);
    }

    return {
      token,
      user,
    };
  } catch (error) {
    throw new GraphQLError(
      `tidak dapat login, hubungi administrator! ${error}`,
      {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      }
    );
  }
};

module.exports = {
  GenerateCode,
  generateToken,
  remember_me,
  comparePassword,
  saveImage,
  deleteImages,
  ReadStreamCSV,
  maskingEmail,
  validasiChangePassword,
  sendNotifSucessUpdatePw,
  createUser,
  login,
  getAllUser,
  editUser,
};
