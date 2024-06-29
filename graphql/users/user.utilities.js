const jwt = require("jsonwebtoken");
const { compareSync, hash, compare } = require("bcrypt");
const moment = require("moment");
const { GraphQLError } = require("graphql");
const UserModel = require("./user.model");
const { validateEmail } = require("filter-validate-email");
const cuti_billingsModel = require("../cuti_billings/cuti_billings.model");

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

/**
 * generate customed remember me token / but its not used now
 *
 * @param {*} length
 * @return {*}
 */
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

const createUser = async (input, ctx) => {
  try {
    if (!input) {
      throw new GraphQLError(`masukan input`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    input.role = "ordinary";
    input.password =
      input && input.password ? await hash(input.password, 10) : "";
    const user = await UserModel.create(input);

    if (user) {
      await cuti_billingsModel.create({
        user_id: user._id,
        tahun: moment().format("YYYY"),
        sisa_cuti: 12,
        taken_annually: 0,
        taken_not_annually: 0,
        total_taken: 0,
        carried_cuti: 0,
        exp_cuti: 0,
        status: "active",
      });
    }
    return user;
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

const createUserByAdmin = async (input, ctx) => {
  try {
    if (!input) {
      throw new GraphQLError(`masukan input`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    if (ctx && ctx.user && ctx.user.role && ctx.user.role == "admin") {
      // if admin add user as verifikator
      input.role = "verifikator";
    } else if (
      ctx &&
      ctx.user &&
      ctx.user.role &&
      ctx.user.role == "verifikator"
    ) {
      // if ordinary  or verifikator user the role sholud be ordinary
      input.role = "ordinary";
    } else {
      throw new GraphQLError(
        "anda tidak memiliki izin untuk menambah data users",
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

    input.password =
      input && input.password ? await hash(input.password, 10) : "";
    const user = await UserModel.create(input);

    if (user) {
      await cuti_billingsModel.create({
        user_id: user._id,
        tahun: moment().format("YYYY"),
        sisa_cuti: 12,
        taken_annually: 0,
        taken_not_annually: 0,
        total_taken: 0,
        carried_cuti: 0,
        exp_cuti: 0,
        status: "active",
      });
    }
    return user;
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
      status:
        filter && filter.status
          ? filter.status
          : {
              $ne: "deleted",
            },
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

const confirmUser = async (id_user, ctx) => {
  try {
    let verifikatorId;
    if (ctx && ctx.user && ctx.user._id) {
      verifikatorId = ctx.user._id;
      if (ctx.user.role == "ordinary") {
        throw new GraphQLError(`anda tidak bisa verifikasi user`, {
          extensions: {
            code: "NOT_ACCEPTED",
            http: {
              status: 406,
            },
          },
        });
      }
    }

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

    let findUser = await UserModel.findOneAndUpdate(
      { _id: id_user, status: "pending" },
      {
        $set: {
          status: "active",
        },
      },
      { new: true }
    );
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

    return findUser;
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const GetOneUser = async (filter, sorting, pagination, ctx) => {
  try {
    if (!_id) {
      throw new GraphQLError(`wajib masukan _id, ${error}`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    let user = await UserModel.findOne({ _id: _id });
    if (!user) {
      throw new GraphQLError(`user tidak ditemukan, ${error}`, {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
      });
    }

    return user;
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
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

      if (String(ctx.user._id) == String(id_user)) {
        prevent_update = false;
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
      throw new GraphQLError(`masukan input`, {
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
        status: "active",
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
          code: "INTERNAL_SERVER_ERROR",
          http: {
            status: 500,
          },
        },
      }
    );
  }
};

const logout = async (ctx) => {
  try {
    let userId;
    if (ctx && ctx.user && ctx.user._id) {
      userId = ctx.user._id;
    } else {
      throw new GraphQLError(`tidak dapat logout, hubungi administrator!`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    const logoutUser = await UserModel.findOneAndUpdate(
      {
        _id: userId,
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
    } else {
      throw new GraphQLError(`Gagal logout`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }
  } catch (error) {
    throw new GraphQLError(
      `tidak dapat logout, hubungi administrator! ${error}`,
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
  generateToken,
  remember_me,
  comparePassword,
  createUser,
  login,
  getAllUser,
  editUser,
  logout,
  GetOneUser,
  createUserByAdmin,
  confirmUser,
};
