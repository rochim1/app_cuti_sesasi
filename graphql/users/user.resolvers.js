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
const { UserModel } = require(".");

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

const Login = async (parent, { input }, ctx) => {
  try {
    let loginData = await UserUtilities.login(input, ctx);
    return loginData;
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

const GetOneUser = async (parent, { _id }, ctx) => {
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

    return user
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

const Logout = async (parent, args, ctx) => {
  try {
    await UserUtilities.logout(ctx);
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

const GetAllUser = async (parent, { filter, sorting, pagination }, ctx) => {
  try {
    return await UserUtilities.getAllUser(filter, sorting, pagination, ctx);
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

const UpdateUser = async (parent, { id_user, input }, ctx) => {
  try {
    return await UserUtilities.editUser(id_user, input, ctx);
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

module.exports = {
  Query: {
    GetOneUser,
    GetAllUser,
  },
  Mutation: {
    CreateUser,
    Login,
    UpdateUser,
    Logout
  },
};
