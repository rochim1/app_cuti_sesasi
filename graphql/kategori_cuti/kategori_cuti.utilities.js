const moment = require("moment");
const common = require("../../utils/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const translationJSON = require("../../utils/translate/translationJSON.json");
const UserModel = require("../users/user.model");
const CutiModel = require("../cuti/cuti.model");
const KategoriCutiModel = require("./kategori_cuti.model");
const { GraphQLError } = require("graphql");

const generateAggregateQuery = (sorting, filter, pagination, ctx) => {
  let aggregateQuery = [];
  let aggregateQueryFilter = {
    status: filter && filter.status ? filter.status : "active",
  };
  let sortingQuery = {
    updatedAt: -1,
  };

  if (filter) {
    if (filter.nama_kategori_cuti) {
      aggregateQueryFilter.nama_kategori_cuti =
        common.createDiacriticSensitiveRegex(filter.nama_kategori_cuti);
    }
    if (filter.tipe) {
      aggregateQueryFilter.tipe = filter.tipe;
    }
    if (filter.jumlah_kuota_hari) {
      aggregateQueryFilter.jumlah_kuota_hari = filter.jumlah_kuota_hari;
    }
  }

  if (sorting) {
    if (sorting.nama_kategori_cuti) {
      sortingQuery = {
        nama_kategori_cuti: sorting.nama_kategori_cuti == "asc" ? 1 : -1,
      };
    }
    if (sorting.jumlah_kuota_hari) {
      sortingQuery = {
        jumlah_kuota_hari: sorting.jumlah_kuota_hari == "asc" ? 1 : -1,
      };
    }
    if (sorting.sugested_day_off) {
      sortingQuery = {
        sugested_day_off: sorting.sugested_day_off == "asc" ? 1 : -1,
      };
    }
    if (sorting.allow_half_day) {
      sortingQuery = {
        allow_half_day: sorting.allow_half_day == "asc" ? 1 : -1,
      };
    }
  }

  aggregateQuery.push(
    {
      $match: aggregateQueryFilter,
    },
    {
      $sort: sortingQuery,
    }
  );

  if (filter && filter.get_only_ids) {
    aggregateQuery.push(
      {
        $project: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          ids: {
            $push: "$_id",
          }, // Push all _id values into an array
        },
      },
      {
        $project: {
          _id: 0,
          ids: 1, // Output just the array of _id values
        },
      }
    );

    return { aggregateQuery };
  }

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

  return { aggregateQuery };
};

const generateAggregateQueryExport = (kategoriCuti_ids) => {
  let aggregateQuery = [];
  let aggregateQueryFilter = {
    status: {
      $ne: "deleted",
    },
    _id: {
      $in: kategoriCuti_ids.map((id) => new ObjectId(id)),
    },
  };

  aggregateQuery.push({
    $match: aggregateQueryFilter,
  });

  return { aggregateQuery };
};

const kategoriCutiMapping = async (data) => {
  let dataUser = {};
  if (data.user_created) {
    dataUser = await UserModel.findOne({
      _id: new ObjectId(data.user_created),
    }).lean();
  }

  let nama_user = dataUser && dataUser.name ? dataUser.name : "-";

  let tipe;
  if (data.tipe) {
    tipe = translationJSON.dayoff_type.ind[data.tipe.toUpperCase()];
  }

  let jumlah_kuota_hari;
  if (data.jumlah_kuota_hari) {
    jumlah_kuota_hari = `${data.jumlah_kuota_hari} hari`;
  }

  let sugested_day_off;
  if (data.sugested_day_off) {
    sugested_day_off = `${data.sugested_day_off} hari`;
  }

  let number_of_exceed;
  if (data.number_of_exceed) {
    number_of_exceed = `${data.number_of_exceed} hari`;
  }

  return {
    ...data,
    tipe,
    jumlah_kuota_hari,
    sugested_day_off,
    number_of_exceed,
    nama_user,
  };
};

const GetAllKategoriCuti = async function (filter, sorting, pagination, ctx) {
  try {
    const { aggregateQuery } = generateAggregateQuery(
      sorting,
      filter,
      pagination,
      ctx
    );

    const data = await KategoriCutiModel.aggregate(aggregateQuery)
      .collation({
        locale: "id",
      })
      .allowDiskUse(true);

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

const GetOneKategoriCuti = async function (_id, ctx) {
  try {
    if (!_id)
      throw new GraphQLError("_id kategori cuti dibutuhkan untuk pencarian", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });

    const getCuti = await KategoriCutiModel.findOne({
      _id: _id,
      status: "active",
    }).lean();

    if (!getCuti) {
      throw new GraphQLError("Cuti tidak ditemukan", {
        extensions: {
          code: "NOT_FOUND",
          http: {
            status: 404,
          },
        },
      });
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

//***** Mutation create cuti by pegawai*/
const CreateKategoriCuti = async function (input, ctx) {
  try {
    if (ctx && ctx.user && ctx.user.role !== "admin") {
      throw new GraphQLError(`anda bukan admin`, {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 406,
          },
        },
      });
    }

    if (input && !input.nama_kategori_cuti) {
      throw new GraphQLError(`Masukkan nama kategori cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    } else {
      const result = await KategoriCutiModel.findOne({
        nama_kategori_cuti: input.nama_kategori_cuti,
      }).lean();

      if (result) {
        throw new GraphQLError(`Nama Kategori Cuti sudah ada`, {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
            },
          },
        });
      }
    }

    if (input && !input.tipe) {
      throw new GraphQLError(`Masukkan tipe cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    const user_id = ctx.user._id;
    input = {
      ...input,
      user_created: user_id,
    };

    const newKategoriCuti = new KategoriCutiModel(input);
    return await newKategoriCuti.save();
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

const UpdateKategoriCuti = async function (_id, input, ctx) {
  try {
    if (ctx && ctx.user && ctx.user.role !== "admin") {
      throw new GraphQLError(`anda bukan admin`, {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 406,
          },
        },
      });
    }

    if (!_id) {
      throw new GraphQLError(`Masukkan _id cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    if (input && !input.nama_kategori_cuti) {
      throw new GraphQLError(`Masukkan nama kategori cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    } else {
      const result = await KategoriCutiModel.findOne({
        nama_kategori_cuti: input.nama_kategori_cuti,
      }).lean();

      if (result && result.nama_kategori_cuti !== input.nama_kategori_cuti) {
        throw new GraphQLError(`Nama Kategori Cuti sudah ada`, {
          extensions: {
            code: "BAD_REQUEST",
            http: {
              status: 400,
            },
          },
        });
      }
    }

    const result = await KategoriCutiModel.findOneAndUpdate(
      { _id: _id },
      {
        $set: input,
      },
      {
        new: true,
      }
    );

    if (result) {
      return result;
    } else {
      throw new GraphQLError("kategori cuti tidak ditemukan", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }
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

const DeleteKategoriCuti = async function (_id, ctx) {
  try {

    if (ctx && ctx.user && ctx.user.role !== "admin") {
      throw new GraphQLError(`anda bukan admin`, {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 406,
          },
        },
      });
    }

    if (!_id) {
      throw new GraphQLError(`Masukkan _id cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    // sebelum hapus todo ada validasi
    const result = await KategoriCutiModel.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          status: "deleted",
        },
      },
      {
        new: true,
      }
    );

    if (result) {
      return result;
    } else {
      throw new GraphQLError("gagal hapus, kategori cuti tidak ditemukan", {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }
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

const ForceDeleteKategoriCuti = async function (_id, ctx) {
  try {
    if (!_id) {
      throw new GraphQLError(`Masukkan _id kategori cuti`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    const getOffDayCategory = await KategoriCutiModel.findOne({ _id }).lean();

    if (!getOffDayCategory) {
      throw new GraphQLError(`kategori cuti tidak ditemukan`, {
        extensions: {
          code: "BAD_REQUEST",
          http: {
            status: 400,
          },
        },
      });
    }

    let getCutis = await CutiModel.findOne({
      tipe_cuti: getOffDayCategory._id,
    });

    if (getCutis) {
      throw new GraphQLError(`tidak dapat menghapus kategori cuti`, {
        extensions: {
          code: "NOT_ACCEPTABLE",
          http: {
            status: 406,
          },
        },
      });
    }

    let deletedKategori = await KategoriCutiModel.deleteOne({_id});

    return {
      is_successed: true,
      message: `${
        getOffDayCategory.nama_kategori_cuti
          ? getOffDayCategory.nama_kategori_cuti
          : "kategori cuti"
      } berhasil dihapus`,
    };
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
  generateAggregateQuery,
  generateAggregateQueryExport,
  kategoriCutiMapping,
  GetAllKategoriCuti,
  GetOneKategoriCuti,
  CreateKategoriCuti,
  UpdateKategoriCuti,
  DeleteKategoriCuti,
  ForceDeleteKategoriCuti,
};
