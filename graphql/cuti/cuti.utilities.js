const moment = require("moment");
const UserModel = require("../users/user.model");
const cron = require("node-cron");

const GetAllCuti = async function (filter, pagination, ctx) {
  try {
    if (ctx && ctx.user && ctx.user.role && ctx.user.role == "ordinary") {
      if (
        filter &&
        filter.user_id &&
        String(ctx.user._id) !== String(filter.user_id)
      ) {
        throw new GraphQLError(
          "anda tidak diperbolehkan melihat list cuti pengguna lain",
          {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
          }
        );
      }
    }

    let aggregateQueryFilter = {
      status: "active",
    };

    let pages = [];

    if (filter) {
      if (filter.user_id) {
        aggregateQueryFilter.user_id = new ObjectId(filter.user_id);
      }

      if (filter.kalender) {
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
          data: pages,
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

    return data[0];
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

const GetOneCuti = async function (cuti_id, ctx) {
  try {
    if (ctx && ctx.user && ctx.user.status && ctx.user.status == "pending") {
      throw new GraphQLError("anda tidak memiliki akses", {
        extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
      });
    }

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

    if (ctx && ctx.user && ctx.user.role && ctx.user.role == "ordinary") {
      if (getCuti.user_id && String(ctx.user._id) !== String(getCuti.user_id)) {
        throw new GraphQLError(
          "anda tidak diperbolehkan melihat detail cuti pengguna lain",
          {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
          }
        );
      }
    }

    return getCuti;
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

const GiveActionForCuti = async function (_id, input, ctx) {
  try {
    let userId;
    if (ctx && ctx.user) {
      userId = ctx.user._id;

      if (ctx.user.role == "ordinary") {
        throw new GraphQLError(`anda tidak memiliki akses`, {
          extensions: {
            code: "NOT_ACCEPTABLE",
            http: {
              status: 406,
            },
          },
        });
      }
    }

    let getDataCuti;
    let getDataKategoriCuti;
    if (!_id) {
      throw new GraphQLError("_id wajib diinputkan", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    } else {
      getDataCuti = await CutiModel.findOne({ _id, status: "active" });
      if (!getDataCuti) {
        throw new GraphQLError("cuti tidak ditemukan", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }
    }

    if (!input || (input && !input.aksi)) {
      throw new GraphQLError("masukan input dengan benar", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    if (input.aksi == "dibatalkan") {
      throw new GraphQLError(
        "anda tidak dapat membatalkan permintaan cuti, terima/tolak",
        {
          extensions: {
            code: "NOT_ACCEPTABLE",
            http: {
              status: 406,
            },
          },
        }
      );
    } else {
      input.status_izin = input.aksi;
      delete input.aksi;
    }

    if (getDataCuti.tipe_cuti) {
      getDataKategoriCuti = await KategoriCutiModel.findOne({
        _id: getDataCuti.tipe_cuti,
      });
      if (!getDataKategoriCuti) {
        throw new GraphQLError("kategori cuti tidak ditemukan", {
          extensions: {
            code: "NOT_FOUND",
            http: {
              status: 404,
            },
          },
        });
      }
    }

    if (getDataCuti.reduce_annually) {
      let cutiBilling = await CutiBillingModel.findOne({
        user_id: getDataCuti.user_id,
        tahun: moment(getDataCuti.tanggal_izin, "YYYY-MM-DD").format("YYYY"),
        status: "active",
      });

      if (!cutiBilling) {
        throw new GraphQLError(
          "anda tidak memiliki cuti billing, hubungi administrator",
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
      let jatah_cuti =
        (cutiBilling.sisa_cuti ? cutiBilling.sisa_cuti : 0) -
        getDataCuti.terhitung_hari;
      let taken_annually = 0;
      let taken_not_annually = 0;
      let total_taken = 0;
      if (jatah_cuti < 0) {
        jatah_cuti = 0;
        taken_not_annually = Math.abs(jatah_cuti);
      }
      taken_annually = +getDataCuti.terhitung_hari - taken_not_annually;
      total_taken = cutiBilling.total_taken + getDataCuti.terhitung_hari;

      let objectUpdate = {
        sisa_cuti: jatah_cuti,
        taken_annually,
        taken_not_annually,
        total_taken,
      };

      let updateBilling = await CutiBillingModel.updateOne(
        { _id: cutiBilling._id },
        {
          $set: objectUpdate,
        },
        {
          new: true,
        }
      );
    }

    input.aktor_aksi = userId;
    input.tanggal_aksi = moment().format("YYYY-MM-DD");
    let cuti = await CutiModel.findOneAndUpdate(
      { _id: getDataCuti._id },
      { $set: input },
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

//***** Mutation create cuti by pegawai*/
const CreateCuti = async function (input, file, ctx) {
  try {
    let user_createdId;
    if (ctx && ctx.user && ctx.user._id) {
      user_createdId = ctx.user._id;
      if (ctx && ctx.user && ctx.user.role && ctx.user.status == "pending") {
        throw new GraphQLError("user belum aktif", {
          extensions: {
            code: "NOT_ACCEPTABLE",
            http: {
              status: 406,
            },
          },
        });
      }
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

    let kategori_cuti;
    let inputErrors = [];
    if (!input.tipe_cuti) {
      inputErrors.push("tipe_cuti");
    } else {
      kategori_cuti = await KategoriCutiModel.findOne({
        _id: input.tipe_cuti,
        status: "active",
      });
      if (!kategori_cuti) {
        throw new GraphQLError("Kategori Cuti tidak ditemukan", {
          extensions: { code: "NOT_FOUND", http: { status: 404 } },
        });
      }
    }

    let tanggalIzin;
    let tanggalMasuk;
    if (!input.alasan) {
      inputErrors.push("alasan");
    }
    if (!input.tanggal_izin) {
      inputErrors.push("tanggal_izin");
    } else {
      tanggalIzin = moment(input.tanggal_izin, "YYYY-MM-DD").format("YYYY");
    }
    if (!input.tanggal_masuk) {
      inputErrors.push("tanggal_masuk");
    } else {
      tanggalMasuk = moment(input.tanggal_masuk, "YYYY-MM-DD")
        .subtract(1, "days")
        .format("YYYY");
    }
    if (!input.terhitung_hari && input.terhitung_hari !== 0) {
      // 0 is acceptable because for hourly leave
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

    if (tanggalIzin && tanggalMasuk) {
      if (tanggalIzin !== tanggalMasuk) {
        // throw error ini dapat di tiadakan jika auto generate biling cuti
        throw new GraphQLError(
          "izin cuti hanya bisa dilakukan pada tahun yang sama",
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
    }

    if (input.terhitung_hari > kategori_cuti.jumlah_kuota_hari) {
      throw new GraphQLError(
        `hari cuti yang diajukan melebihi kuota kategori cuti ${kategori_cuti.jumlah_kuota_hari}`,
        {
          extensions: { code: "NOT_FOUND", http: { status: 404 } },
        }
      );
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

const UpdateCuti = async (input, cuti_id, file, ctx) => {
  try {
    let findCuti = await CutiModel.findOne({ _id: cuti_id, status: "active" });

    let userAccessedId;
    let userCreated;
    if (ctx && ctx.user) {
      userCreated = ctx.user;
      userAccessedId = ctx.user._id ? ctx.user._id : null;
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

    if (!findCuti) {
      throw new GraphQLError("Cuti tidak ditemukan", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    }

    if (String(findCuti.user_id) !== String(userAccessedId)) {
      throw new GraphQLError("anda bukan pemilik cuti", {
        extensions: { code: "NOT_ACCEPTED", http: { status: 406 } },
      });
    }

    if (findCuti.status_izin !== "diajukan") {
      throw new GraphQLError(
        "tidak dapat update cuti yang telah disetujui/tolak/dibatalkan",
        {
          extensions: { code: "NOT_ACCEPTED", http: { status: 406 } },
        }
      );
    }

    // who can update cuti ? only owner
    if (String(userAccessedId) != String(findCuti.user_id)) {
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

    let findKategoriCuti = await KategoriCutiModel.find({
      _id: findCuti.tipe_cuti,
      status: "active",
    });
    if (!findKategoriCuti) {
      throw new GraphQLError("tipe / kategori cuti tidak ditemukan", {
        extensions: {
          code: "NOT_FOUND",
          http: {
            status: 404,
          },
        },
      });
    }

    if (input.aksi && input.aksi == "dibatalkan") {
      input.aktor_aksi = userAccessedId;
      input.status_izin = input.aksi;
    } else if (input.aksi && input.aksi !== "dibatalkan") {
      throw new GraphQLError("anda tidak memiliki akses", {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 406,
          },
        },
      });
    }

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

const DeleteCuti = async (cuti_id, ctx) => {
  try {
    let findCuti = await CutiModel.findOne({
      _id: cuti_id,
      status: "active",
      status_izin: "diajukan",
    });

    if (!findCuti) {
      throw new GraphQLError("Cuti tidak ditemukan", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    }

    let userAccessedId;
    if (ctx && ctx.user) {
      userAccessedId = ctx.user._id ? ctx.user._id : null;
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

    if (String(findCuti.user_id) !== String(userAccessedId)) {
      throw new GraphQLError("anda bukan pemilik cuti", {
        extensions: { code: "NOT_ACCEPTED", http: { status: 406 } },
      });
    }
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
    GetAllCuti,
    GetOneCuti,
    GiveActionForCuti,
    CreateCuti,
    UpdateCuti,
    DeleteCuti
};
