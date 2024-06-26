const KategoriCutiModel = require("./kategori_cuti.model");
const moment = require("moment");
const { GraphQLError } = require("graphql");
const KategoriCutiUtilities = require("./kategori_cuti.utilities");
const common = require("../../utils/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const UserModel = require("../users/user.model");

//***** Query*/
const GetAllKategoriCuti = async function (
  parent,
  { filter, sorting, pagination },
  ctx
) {
  try {
    let result = await KategoriCutiUtilities.GetAllKategoriCuti(filter, sorting, pagination, ctx);
    return result;
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

const GetOneKategoriCuti = async function (parent, { _id }, ctx) {
  try {
    let result = await KategoriCutiUtilities.GetOneKategoriCuti( _id, ctx);
    return result;
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

//***** Mutation create cuti by pegawai*/
const CreateKategoriCuti = async function (parent, { input }, ctx) {
  try {
    let result = await KategoriCutiUtilities.CreateKategoriCuti(input, ctx);
    return result;
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

const UpdateKategoriCuti = async function (parent, { _id, input }, ctx) {
  try {
    let result = await KategoriCutiUtilities.UpdateKategoriCuti(_id, input, ctx);
    return result;
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

const DeleteKategoriCuti = async function (parent, { _id }, ctx) {
  try {
    let result = await KategoriCutiUtilities.DeleteKategoriCuti(_id, ctx);
    return result;
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

const ForceDeleteKategoriCuti = async function (parent, { _id }, ctx) {
  try {
    let result = await KategoriCutiUtilities.ForceDeleteKategoriCuti(_id, ctx);
    return result;
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

//***** Loader */

const userLoader = async (parent, args, ctx) => {
  if (parent && parent.user_created) {
    return await ctx.userLoader.load(parent.user_created);
  }
};

const selectedUserLoader = async (parent, args, ctx) => {
  try {
    if (parent && parent.selected_users && parent.selected_users.length) {
      return parent.selected_users.map(async (data) => {
        return await UserModel.findOne({ _id: data._id });
      });
    }
  } catch (error) {
    console.log("loader selectedUserLoader error");
  }
};

module.exports = {
  Query: {
    GetAllKategoriCuti,
    GetOneKategoriCuti,
  },
  Mutation: {
    CreateKategoriCuti,
    UpdateKategoriCuti,
    DeleteKategoriCuti,
    ForceDeleteKategoriCuti,
  },
  KategoriCuti: {
    user_created: userLoader,
    selected_users: selectedUserLoader,
  },
};
