
const userModel = require("./user.model");
const nodemailer = require("nodemailer");
const { hash, compare } = require("bcrypt");
const UserUtilities = require("./user.utilities");
const jwt = require("jsonwebtoken");
const { validateEmail } = require("filter-validate-email");
const moment = require("moment");
const common = require("../../utils/common");
const { GraphQLError } = require("graphql");
const handlebars = require("handlebars");
const fs = require("fs");
const _ = require("lodash");
const translationJSON = require("../../utils/translate/translationJSON.json");
const { CutiBillingsModel } = require("../cuti_billings");

/**
 * this function is for register user
 *
 * @param {*} parent
 * @param {*} {
 *   input
 * }
 * @param {*} ctx
 */
const CreateUser = async (parent, { input }, ctx) => {
  try {
    return await UserUtilities.createUser(input, ctx);
  } catch (error) {
    throw new GraphQLError(
      `Error, ${error}`,
      {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
        },
      }
    );
  }
};

const Login = async (parent, { input }, ctx) => {
  try {
    let loginData =  await UserUtilities.login(input, ctx);
    return loginData
  } catch (error) {
    throw new GraphQLError(
      `Error, ${error}`,
      {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
        },
      }
    );
  }
};

const GetOneUser = async (parent, { _id }, ctx) => {};

const Logout = async (parent, args, ctx) => {
  const logoutUser = await userModel.findOneAndUpdate(
    {
      _id: ctx.user._id,
      status: "active",
    },
    {
      $set: {
        remember_token: "",
        mac_address: "",
      },
    }
  );

  if (logoutUser) {
    return {
      is_successed: true,
      message: `Berhasil logout`,
    };
  }

  throw new GraphQLError(`Gagal logout`, {
    extensions: {
      code: "BAD_REQUEST",
      http: {
        status: 400,
      },
    },
  });
};

const RequestChangePassword = async (
  parent,
  { _id, email, is_web, new_password },
  ctx
) => {
  let findObject = {
    email: email,
    status: "active",
  };
  findObject = _id
    ? {
        _id: _id,
      }
    : findObject;

  let user = await userModel.findOne(findObject);

  if (!user) {
    throw new GraphQLError("email tidak ditemukan", {
      extensions: {
        code: "BAD_REQUEST",
        http: {
          status: 400,
        },
      },
    });
  }

  email = email ? email : user.email;
  let token = UserUtilities.GenerateCode(5);
  await userModel.updateOne(
    {
      email: email,
      status: "actove",
    },
    {
      $set: {
        change_tkn: token,
        device_tkn: is_web ? "web" : "mobile",
        temp_psw: await hash(new_password, 10),
      },
    }
  );

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
            <a href='https://presensi.zensemitraraya.com/reset-password?token=${token}$device=${
      is_web ? "web" : "mobile"
    }' style="padding: 10px 0;">Saya menyetujui</a>
          </td>
        </tr>
      </table>
    `,
  };

  try {
    let sendmail = transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        console.log("err:", error);
        return false;
      }

      return true;
    });

    email = UserUtilities.maskingEmail(email);
    return {
      message: `Email terkirim ke ${email}`,
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

const RequestChangePasswordWeb = async (parent, { _id }, ctx) => {
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
        moment(user.allow_change_pw_after).format("DD/MM/YYYY HH:mm:ss"),
      {
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
  const expirationTime = "10m";
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
    batasWaktu: moment().add(10, "minutes").format("DD-MM-YYY HH:mm:ss"),
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

    await userModel.updateOne(
      {
        _id: user._id,
      },
      {
        $push: {
          date_request_change_pw: currentDate.format(),
        },
      }
    );
    email = UserUtilities.maskingEmail(email);
    return {
      message: `Email terkirim ke ${email}`,
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

const GetAllUser = async (parent, { filter, sorting, pagination }, ctx) => {
  try {
    return await UserUtilities.getAllUser(filter, sorting, pagination, ctx);
  } catch (error) {
    throw new GraphQLError(
      `Error, ${error}`,
      {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
        },
      }
    );
  }
};

const UpdateUser = async (parent, { id_user, input }, ctx) => {
  try {
    return await UserUtilities.editUser(id_user, input, ctx);
  } catch (error) {
    throw new GraphQLError(
      `Error, ${error}`,
      {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
        },
      }
    );
  }
};

module.exports = {
  Query: {
    GetOneUser,
    GetAllUser,
  },
  Mutation: {
    CreateUser,
    Login,
    UpdateUser
  },
};
