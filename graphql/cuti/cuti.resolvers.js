const CutiModel = require("./cuti.model");
const KategoriCutiModel = require("../kategori_cuti/kategori_cuti.model");
const moment = require("moment");
const { GraphQLError } = require("graphql");
const CutiUtilities = require("./cuti.utilities");
const UserModel = require("../users/user.model");
const common = require("../../utils/common");

//***** Query*/
const GetAllCuti = async function (parent, { filter, pagination }, ctx) {
  let aggregateQueryFilter = {
    status: "active",
  };

  let pages = [
    {
      $match: {
        instansi_id: ctx.user.instansi_id,
      },
    },
  ];

  if (filter) {
    if (filter.detail_cuti) {
      aggregateQueryFilter.user_id = ctx.user._id;
    }

    if (filter.kalender) {
      const filterTanggal = moment(filter.kalender, "YYYY-MM");
      const startOf = filterTanggal.startOf("month").format("YYYY-MM-DD");
      const endOf = filterTanggal.endOf("month").format("YYYY-MM-DD");

      const ranges = await CutiUtilities.dateRange(startOf, endOf);

      const cutiData = await CutiModel.find({
        $or: [
          {
            tanggal_izin: {
              $in: ranges,
            },
          },
          {
            tanggal_masuk: {
              $in: ranges,
            },
          },
        ],
      });

      aggregateQueryFilter._id = {
        $in: cutiData.map((cutiId) => cutiId._id),
      };
    }
  }

  pages.push({ $match: aggregateQueryFilter });

  if (pagination) {
    let skip = pagination.limit * pagination.page;
    pages.push(
      {
        $skip: skip,
      },
      {
        $limit: pagination.limit,
      }
    );
  }

  const data = await CutiModel.aggregate([
    {
      $facet: {
        cuti: pages,
        info_page: [
          {
            $match: aggregateQueryFilter,
          },
          {
            $group: { _id: null, count: { $sum: 1 } },
          },
        ],
      },
    },
  ]);

  //   if (data[0].cuti.length === 0) {
  //     throw new GraphQLError("Tidak ada cuti", {
  //       extensions: { code: "NOT_FOUND", http: { status: 404 } },
  //     });
  //   }

  return data[0];
};

const GetOneCuti = async function (parent, { cuti_id }, ctx) {
  if (!cuti_id)
    throw new GraphQLError("cuti_id dibutuhkan pencarian cuti", {
      extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });
  const getCuti = await CutiModel.findOne({
    _id: cuti_id,
    status: "active",
  }).lean();

  if (!getCuti) {
    throw new GraphQLError("Cuti tidak ditemukan", {
      extensions: { code: "NOT_FOUND", http: { status: 404 } },
    });
  }
  return getCuti;
};

const GetPengaturanCuti = async function (parent, params, ctx) {};

//***** Mutation create cuti by pegawai*/
const CreateCuti = async function (parent, { input, file }, ctx) {
  try {
    let user_createdId;
    if (ctx && ctx.user) {
      user_createdId = ctx.user._id;
    } else {
      throw new GraphQLError(
        "anda tidak memiliki akses, silahkan login kembali",
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

    if (file) {
      // todo, to save file approval
    }

    if (!input) {
      throw new GraphQLError("masukkan input", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    let inputErrors = [];
    if (!input.tipe_cuti) {
      inputErrors.push("tipe_cuti");
    }
    if (!input.alasan) {
      inputErrors.push("alasan");
    }
    if (!input.tanggal_izin) {
      inputErrors.push("tanggal_izin");
    }
    if (!input.tanggal_masuk) {
      inputErrors.push("tanggal_masuk");
    }
    if (!input.terhitung_hari) {
      inputErrors.push("terhitung_hari");
    }

    if (inputErrors && inputErrors.length) {
      throw new GraphQLError(`masukkan input ${inputErrors} dengan benar`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    input.user_id = user_createdId;
    let cuti = CutiModel.create(input);

    return cuti;
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
    let findCuti = CutiModel.findOne({ _id: cuti_id });

    if (!findCuti) {
      throw new GraphQLError("Cuti tidak ditemukan", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    }

    let user_createdId;
    if (ctx && ctx.user) {
      user_createdId = ctx.user._id;
    } else {
      throw new GraphQLError(
        "anda tidak memiliki akses, silahkan login kembali",
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

    // who can update cuti ? only owner
    if (String(user_createdId) != String(findCuti.user_id)) {
      throw new GraphQLError("Anda bukan pemilik cuti", {
        extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
      });
    }

    if (file) {
      // todo, to save file approval
    }

    if (!input) {
      throw new GraphQLError("masukkan input", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    let inputErrors = [];
    if (!input.tipe_cuti) {
      inputErrors.push("tipe_cuti");
    } else {
        let findKategoriCuti = await KategoriCutiModel.find({ _id: input.tipe_cuti, status: "active"})
        if (!findKategoriCuti) {
            
        }
    }
    if (!input.alasan) {
      inputErrors.push("alasan");
    }
    if (!input.tanggal_izin) {
      inputErrors.push("tanggal_izin");
    }
    if (!input.tanggal_masuk) {
      inputErrors.push("tanggal_masuk");
    }
    if (!input.terhitung_hari) {
      inputErrors.push("terhitung_hari");
    }

    if (inputErrors && inputErrors.length) {
      throw new GraphQLError(`masukkan input ${inputErrors} dengan benar`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    input.user_id = user_createdId;
    let cuti = CutiModel.findOneAndUpdate(
      { _id: findCuti._id },
      {
        $set: input,
      },
      { new: true }
    );

    return cuti;
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
  const deleteCuti = await CutiModel.findOneAndUpdate(
    { _id: cuti_id, status_izin: "diajukan" },
    {
      $set: {
        status: "deleted",
        deleted_at: moment().format("DD/MM/YYYY").toString(),
      },
    },
    { new: true }
  );

  if (!deleteCuti) {
    throw new GraphQLError(`Status izin dari cuti sudah bukan diajukan`, {
      extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });
  }

  return deleteCuti;
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
    GetPengaturanCuti,
  },
  Mutation: {
    CreateCuti,
    UpdateCuti,
    DeleteCuti,
  },
  Cuti: {
    user_id: userLoader,
    aktor_aksi: aksiLoader,
  },
};
