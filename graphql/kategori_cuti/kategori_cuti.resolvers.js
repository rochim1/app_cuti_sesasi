const KategoriCutiModel = require('./kategori_cuti.model');
const moment = require("moment");
const {
    GraphQLError
} = require("graphql");
const KategoriCutiUtilities = require('./kategori_cuti.utilities')
const common = require('../../utils/common');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const UserModel = require("../users/user.model")

//***** Query*/  
const GetAllKategoriCuti = async function (parent, {
    filter,
    sorting,
    pagination
}, ctx) {

    const {
        aggregateQuery
    } = KategoriCutiUtilities.generateAggregateQuery(sorting, filter, pagination, ctx);
    
    const data = await KategoriCutiModel.aggregate(aggregateQuery).collation({
        locale: "id"
    }).allowDiskUse(true);

    return data[0]
}

const SelectAllKategoriCuti = async function (parent, {
    filter,
    sorting,
    pagination
}, ctx) {
    // filter.get_only_ids harus true
    const {
        aggregateQuery
    } = KategoriCutiUtilities.generateAggregateQuery(sorting, filter, pagination, ctx);

    const data = await KategoriCutiModel.aggregate(aggregateQuery).collation({
        locale: "id"
    }).allowDiskUse(true);

    return data[0]
}

const GetAllKategoriCutiResponsible = async function (parent, {
    filter,
    sorting,
    pagination
}, ctx) {
    const user_id = ctx.user._id;
    const user_tipe = ctx.user.employ_status;
    const instansi_id = ctx.user.instansi_id;

    let aggregateQuery = [];
    let aggregateQueryFilter = {
        status: filter && filter.status ? filter.status : 'active',
        instansi_id: instansi_id,
        $or: [{
                selected_users: {
                    $eq: new ObjectId(user_id)
                }
            },
            {
                delegated_to_all: true
            },
            {
                selected_delegated: user_tipe
            }
        ]
    }
    let sortingQuery = {
        updatedAt: -1
    };

    if (filter) {
        if (filter.nama_kategori_cuti) {
            aggregateQueryFilter.nama_kategori_cuti = common.createDiacriticSensitiveRegex(filter.nama_kategori_cuti)
        }
        if (filter.tipe) {
            aggregateQueryFilter.tipe = filter.tipe
        }
        if (filter.jumlah_kuota_hari) {
            aggregateQueryFilter.jumlah_kuota_hari = filter.jumlah_kuota_hari
        }
        if (filter.allow_half_day) {
            aggregateQueryFilter.allow_half_day = filter.allow_half_day
        }
    }

    if (sorting) {
        if (sorting.nama_kategori_cuti) {
            sortingQuery = {
                nama_kategori_cuti: sorting.nama_kategori_cuti == "asc" ? 1 : -1
            }
        }
        if (sorting.jumlah_kuota_hari) {
            sortingQuery = {
                jumlah_kuota_hari: sorting.jumlah_kuota_hari == "asc" ? 1 : -1
            }
        }
        if (sorting.sugested_day_off) {
            sortingQuery = {
                sugested_day_off: sorting.sugested_day_off == "asc" ? 1 : -1
            }
        }
    }

    aggregateQuery.push({
        $match: aggregateQueryFilter
    }, {
        $sort: sortingQuery
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
            kategoriCuti: paginationQuery,
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

    const data = await KategoriCutiModel.aggregate(aggregateQuery).collation({
        locale: "id"
    }).allowDiskUse(true);

    return data[0]
}

const GetOneKategoriCuti = async function (parent, {
    _id
}, context) {

    if (!_id) throw new GraphQLError("_id kategori cuti dibutuhkan untuk pencarian", {
        extensions: {
            code: "BAD_REQUEST",
            http: {
                status: 400
            }
        },
    });

    const getCuti = await KategoriCutiModel.findOne({
        _id: _id,
        status: 'active'
    }).lean();
    
    if (!getCuti) {
        throw new GraphQLError('Cuti tidak ditemukan', {
            extensions: {
                code: "NOT_FOUND",
                http: {
                    status: 404
                }
            },
        });
    }

    return getCuti;
}

const CheckAvaliableKategoriCutiName = async function (parent, {
    nama_kategori_cuti, exception_ids
}, ctx) {
    const instansi_id = ctx.user.instansi_id;
    let findObject = {
        instansi_id: instansi_id,
        status: {
            $ne: "deleted"
        },
        nama_kategori_cuti: nama_kategori_cuti
    }

    if (exception_ids && exception_ids.length) {
        findObject._id = {
            $nin: exception_ids
        }
    }
    
    const result = await KategoriCutiModel.findOne(findObject).lean()
    
    return result ? false : true
}

//***** Mutation create cuti by pegawai*/ 
const CreateKategoriCuti = async function (parent, {
    input
}, ctx) {

    if (input && !input.nama_kategori_cuti) {
        throw new GraphQLError(`Masukkan nama kategori cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    if (input && !input.tipe) {
        throw new GraphQLError(`Masukkan tipe cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    const user_id = ctx.user._id;
    const instansi_id = ctx.user.instansi_id;

    input = {
        ...input,
        user_created: user_id,
        instansi_id: instansi_id
    }

    const newKategoriCuti = new KategoriCutiModel(input);
    return await newKategoriCuti.save();
}

const UpdateKategoriCuti = async function (parent, {
    _id,
    input
}, ctx) {

    if (!_id) {
        throw new GraphQLError(`Masukkan _id cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    if (input && !input.nama_kategori_cuti) {
        throw new GraphQLError(`Masukkan nama kategori cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    const result = await KategoriCutiModel.findOneAndUpdate({_id: _id}, {
        $set: input
    }, {
        new: true
    })

    if (result) {
        return result;
    } else {
        throw new GraphQLError("kategori cuti tidak ditemukan", {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }
}

const DeleteKategoriCuti = async function (parent, { _id }, ctx) {

    if (!_id) {
        throw new GraphQLError(`Masukkan _id cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    // sebelum hapus todo ada validasi
    const result = await KategoriCutiModel.findOneAndUpdate({_id: _id}, {
        $set: {
            status: 'deleted'
        }
    }, {
        new: true
    })

    if (result) {
        return result;
    } else {
        throw new GraphQLError("kategori cuti tidak ditemukan", {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }


}

const ForceDeleteKategoriCuti = async function (parent, {
    _id
}, ctx) {

    if (!_id) {
        throw new GraphQLError(`Masukkan _id kategori cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    const getOffDayCategory = await KategoriCutiModel.findOne(_id).lean()

    if (!getOffDayCategory) {
        throw new GraphQLError(`kategori cuti tidak ditemukan`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    let getCutis = await CutiModel.find({
        kategori_cuti: getOffDayCategory._id
    })

    if (getCutis) {
        throw new GraphQLError(`tidak dapat menghapus kategori cuti`, {
            extensions: {
                code: "BAD_REQUEST",
                http: {
                    status: 400
                }
            },
        });
    }

    let deletedKategori = await KategoriCutiModel.deleteOne(_id)

    return {
        is_successed: true,
        message: `${ getOffDayCategory.nama_kategori_cuti? getOffDayCategory.nama_kategori_cuti : 'kategori cuti' } berhasil dihapus`
    }
}

async function ExportKateogriCuti(parent, {
    input
}) {
    const today = moment().format('DD-MM-YYYY');

    let delimiter;

    // ***** cek input parameter
    if (input && input.kategoriCuti_ids && input.kategoriCuti_ids.length) {
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

    const {
        aggregateQuery
    } = KategoriCutiUtilities.generateAggregateQueryExport(input.kategoriCuti_ids);

    let kategoriCuti = await KategoriCutiModel.aggregate(aggregateQuery).collation({
            locale: "id",
        })
        .allowDiskUse(true);
    
    // sebenernya bisa lookup dari aggregate diatas tapi ini buat pengetahuan kalau looping promis bisa di await dengan cara berikut
    let promises = kategoriCuti.map(async (data) => {
        return await KategoriCutiUtilities.kategoriCutiMapping(data)
    })
    // Use Promise.all to await all the promises
    kategoriCuti = await Promise.all(promises);

    const csvName = `export-kategori-cuti-${today}.csv`;
    const pathCsv = `./files/${csvName}`

    let recordsCsvString = [];
    let index = 1;

    // ***** loop per user
    for (const eachKategori of kategoriCuti) {
        // records to csv string
        recordsCsvString.push({
            no: index,
            nama_kategori: eachKategori.nama_kategori_cuti ? eachKategori.nama_kategori_cuti : '-',
            tipe: eachKategori.tipe ? eachKategori.tipe : '-',
            tanggal_efektif: eachKategori.effective_date ? eachKategori.effective_date : '-',
            tanggal_exp: eachKategori.exp_date ? eachKategori.exp_date : '-',
            kuota: eachKategori.jumlah_kuota_hari ? eachKategori.jumlah_kuota_hari : '-',
            saran: eachKategori.sugested_day_off ? eachKategori.sugested_day_off : '-',
            exceed_tolerance: eachKategori.number_of_exceed ? eachKategori.number_of_exceed : '-',
            allow_half_day: eachKategori.allow_half_day ?  '✓' : '✗',
            Tipe_User: eachKategori.delegated_to_all ?  '✗' : '✓' ,
            dibuat_oleh: eachKategori.nama_user ? eachKategori.nama_user : '-',
            status: eachKategori.status == 'active' ? '✓' : '✗',
        })

        index++;
    }

    const headers = [
        [
            'No',
            'nama kategori',
            'tipe',
            'tanggal efektif',
            'tanggal exp',
            'kuota',
            'saran',
            'exceed tolerance',
            'allow half day',
            'All Tipe User',
            'dibuat oleh',
            'status',
        ],
    ];

    const result = common.convertToCsv(recordsCsvString, headers);
    return {
        name: csvName,
        data: result
    };
    // if want to save in folder
    fs.writeFileSync(pathCsv, csvData, 'utf-8');
}


//***** Loader */

const userLoader = async (parent, args, ctx) => {
    if (parent && parent.user_created) {
        return await ctx.userLoader.load(parent.user_created);
    }
}

const selectedUserLoader = async (parent, args, ctx) => {
    try {
        if (parent && parent.selected_users && parent.selected_users.length) {
            return parent.selected_users.map(async (data) => {
                return await UserModel.findOne({_id: data._id});
            });
        }
    } catch (error) {
        console.log('loader selectedUserLoader error')
    }
}

const selectedDivisiLoader = async (parent, args, ctx) => {
    try {
        if (parent && parent.selected_delegated_divisi && parent.selected_delegated_divisi.length) {
            return parent.selected_delegated_divisi.map(async (data) => {
                return await ctx.divisiLoader.load(data._id)
            });
        }
    } catch (error) {
        console.log('loader selectedDivisiLoader error')
    }
  };

module.exports = {
    Query: {
        GetAllKategoriCuti,
        SelectAllKategoriCuti,
        GetOneKategoriCuti,
        GetAllKategoriCutiResponsible,
        CheckAvaliableKategoriCutiName
    },
    Mutation: {
        CreateKategoriCuti,
        UpdateKategoriCuti,
        DeleteKategoriCuti,
        ForceDeleteKategoriCuti,
        ExportKateogriCuti
    },
    KategoriCuti: {
        user_created: userLoader,
        selected_users: selectedUserLoader,
        selected_delegated_divisi: selectedDivisiLoader,
    },
}