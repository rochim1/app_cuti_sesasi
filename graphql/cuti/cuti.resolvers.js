const CutiModel = require("./cuti.model");
const KategoriCutiModel = require("../kategori_cuti/kategori_cuti.model");
const moment = require("moment");
const { GraphQLError } = require("graphql");
const CutiUtilities = require("./cuti.utilities");
const UserModel = require("../users/user.model");
const CutiBillingModel = require("../cuti_billings/cuti_billings.model");
const common = require("../../utils/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//***** Query*/
const GetAllCuti = async function (parent, { filter, pagination }, ctx) {
  try {
    let result = await CutiUtilities.GetAllCuti(filter, pagination, ctx)
    return result
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

const GetOneCuti = async function (parent, { cuti_id }, ctx) {
  try {
    let result = await CutiUtilities.GetOneCuti(cuti_id, ctx)
    return result
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

const GiveActionForCuti = async function (parent, { _id, input }, ctx) {
  try {
    let result = await CutiUtilities.GiveActionForCuti(_id, input, ctx)
    return result
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
const CreateCuti = async function (parent, { input, file }, ctx) {
  try {
    let result = await CutiUtilities.CreateCuti( input, file, ctx)
    return result
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

const UpdateCuti = async (parent, { input, cuti_id, file }, ctx) => {
  try {
    let result = await CutiUtilities.UpdateCuti( input, cuti_id, file, ctx)
    return result
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

const DeleteCuti = async (parent, { cuti_id }, ctx) => {
  try {
    let result = await CutiUtilities.DeleteCuti( cuti_id, ctx)
    return result
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
const aksiLoader = async (parent, args, ctx) => {
  if (parent && parent.aktor_aksi) {
    return await ctx.userLoader.load(parent.aktor_aksi);
  }
};

const userLoader = async (parent, args, ctx) => {
  if (parent && parent.user_id) {
    return await ctx.userLoader.load(parent.user_id);
  }
};

const cutiApproverLoader = async (parent, args, ctx) => {
  try {
    if (parent && parent.cuti_approver && parent.cuti_approver.length) {
      return parent.cuti_approver.map(async (data) => {
        return await UserModel.findOne({ _id: data._id });
      });
    }
  } catch (error) {
    console.log("loader cutiApproverLoader error");
  }
};

const forwardDivisiLoader = async (parent, args, ctx) => {
  try {
    if (
      parent &&
      parent.forward_selected_divisi &&
      parent.forward_selected_divisi.length
    ) {
      return parent.forward_selected_divisi.map(async (data) => {
        return await ctx.divisiLoader.load(data._id);
      });
    }
  } catch (error) {
    console.log("loader forwardDivisiLoader error");
  }
};

module.exports = {
  Query: {
    GetAllCuti,
    GetOneCuti,
  },
  Mutation: {
    CreateCuti,
    UpdateCuti,
    DeleteCuti,
    GiveActionForCuti,
  },
  Cuti: {
    user_id: userLoader,
    aktor_aksi: aksiLoader,
  },
};
