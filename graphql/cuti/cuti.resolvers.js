const CutiModel = require('./cuti.model');
const moment = require("moment");
const { GraphQLError } = require("graphql");
const CutiUtilities = require('./cuti.utilities')
const UserUtilities = require("../users/user.utilities");
const UserModel = require('../users/user.model');
const common = require('../../utils/common');
const SettingModel = require('../setting/setting.model');
const NotifikasiUtilities = require('../notifikasi/notifikasi.utilities');

//***** Query*/  
const GetAllCuti = async function (parent, { filter, pagination }, ctx){
    let aggregateQueryFilter = {
        status: 'active'
    }

    let pages = [{
        $match: {
            instansi_id: ctx.user.instansi_id
        }
    }];

    if (filter) {
        if (filter.detail_cuti) {
            aggregateQueryFilter.user_id = ctx.user._id
        }

        if (filter.kalender) {
            const filterTanggal = moment(filter.kalender, 'YYYY-MM');
            const startOf = filterTanggal.startOf('month').format('YYYY-MM-DD');
            const endOf = filterTanggal.endOf('month').format('YYYY-MM-DD');

            const ranges = await CutiUtilities.dateRange(startOf, endOf);
    
            const cutiData = await CutiModel.find({ 
                $or: [
                    {
                        tanggal_izin: {
                            $in: ranges
                        }
                    },
                    {
                        tanggal_masuk: {
                            $in: ranges
                        }
                    }
                ]
            })
            
            aggregateQueryFilter._id = {
                $in: cutiData.map(cutiId => cutiId._id)
            }
        }
    }

    pages.push({ $match: aggregateQueryFilter })
    
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

    return data[0]
}

const GetOneCuti = async function (parent, { cuti_id }, ctx){
    if (!cuti_id) throw new GraphQLError("cuti_id dibutuhkan pencarian cuti", {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });
    const getCuti = await CutiModel.findOne({ _id: cuti_id, status: 'active' }).lean();

    if (!getCuti) {
        throw new GraphQLError('Cuti tidak ditemukan', {
            extensions: { code: "NOT_FOUND", http: { status: 404 } },
        });
    }
    return getCuti;
}

const GetPengaturanCuti = async function (parent, params, ctx){
    let instansi_id = ctx.user.instansi_id;

    if (!instansi_id) throw new GraphQLError("instansi_id tidak ada, hubungi tim pengembang", {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });

    let pengaturanCuti = await SettingModel.findOne({ instansi_id: instansi_id, status: 'active' }).select('_id pengaturan_cuti').lean();

    if (!pengaturanCuti) {
        throw new GraphQLError('pengaturan cuti tidak ditemukan', {
            extensions: { code: "NOT_FOUND", http: { status: 404 } },
        });
    }

    pengaturanCuti = {
        ...pengaturanCuti.pengaturan_cuti,
        setting_id: pengaturanCuti._id
    }

    return pengaturanCuti;
}

//***** Mutation create cuti by pegawai*/ 
const CreateCuti = async function (parent, { input, file }, ctx) {
    let filePath = ''
    let cuti;
    input.instansi_id = ctx.user.instansi_id

    if (file) {
        const { createReadStream, filename } = await file;

        const extention = filename ? filename.split('.') : false;

        if ((extention && extention.length && !['pdf', 'jpg', 'jpeg', 'png', 'docx'].includes(extention[extention.length - 1])) || (!extention)) throw new GraphQLError('Masukkan file dan file izin harus berekstensi pdf/jpg/jpeg/png/docx', {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
        })

        filePath = `./static/${filename}`;
        const writeFile = await common.writeFile(createReadStream(), filePath);

        if (writeFile) {
            const data = await UserUtilities.saveImage(filePath);

            input.file_izin = data && data.base64File ? data.base64File : '';
            input.filename = filename
        }
    }

    //untuk pengajuan cuti
    if (input && input.status_izin && input.status_izin === 'diajukan') {
        input.tanggal_pengajuan = moment().format('YYYY-MM-DD');
        input.tanggal_izin = input && input.tanggal_izin ? moment(input.tanggal_izin).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        input.tanggal_masuk = input && input.tanggal_izin ? moment(input.tanggal_masuk).format('YYYY-MM-DD') : '';
        input.user_id = ctx.user._id

        const start = moment(input.tanggal_izin, "YYYY-MM-DD");
        const end = moment(input.tanggal_masuk, "YYYY-MM-DD");
        
        let difference = moment.duration(end.diff(start)).asDays();
        console.log(difference, ctx.user.sisa_cuti)

        if (input && !['izin_sakit', 'izin_kehamilan'].includes(input.tipe_cuti) && ctx.user.sisa_cuti && ctx.user.sisa_cuti < difference ) throw new GraphQLError(`Selain izin sakit dan kehamilan hanya diizinkan selama ${ctx.user.sisa_cuti} hari dari sisa cuti`, {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
        })

        cuti = await CutiModel.create(input);

        await NotifikasiUtilities.adminAddNewTaskNotif(
            'notifikasi_cuti_diajukan', 
            'Anda berhasil membuat Izin kerja, tunggu hingga di setujui oleh Penanggung Jawab.', 
            cuti.user_id, 
            null,
            null,
        )

        if (filePath) {
            await UserUtilities.deleteImages(filePath);
        }
    } else if (input && input.status_izin && ['diterima', 'ditolak'].includes(input.status_izin)) {
        //untuk approval cuti
        if (!ctx.user.is_admin) throw new GraphQLError('Approval cuti hanya dari admin', {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
        })

        if (input && !input.cuti_id) throw new GraphQLError('cuti_id diperlukan untuk mencari data cuti user', {
            extensions: { code: "BAD_REQUEST", http: { status: 404 } },
        })
        
        input.tanggal_aksi = input && input.tanggal_aksi ? moment(input.tanggal_aksi).format() : moment().format()
        input.aktor_aksi = ctx.user._id 
        input.is_response_by_admin = true 

        cuti = await CutiModel.findOneAndUpdate({ _id: input.cuti_id, status: 'active' }, { $set: input}, {new: true});
        const start = moment(cuti.tanggal_izin, "YYYY-MM-DD");
        const end = moment(cuti.tanggal_masuk, "YYYY-MM-DD");
        
        let difference = moment.duration(end.diff(start)).asDays();

        const user = await UserModel.findOne({ _id: cuti.user_id, status: 'active' });
        
        if (input && input.status_izin === 'diterima' && cuti && moment(cuti.tanggal_aksi).isBefore(moment(cuti.tanggal_izin))) {
            if (cuti && !['izin_sakit', 'izin_kehamilan'].includes(cuti.tipe_cuti) &&  user.sisa_cuti && user.sisa_cuti < difference ) throw new GraphQLError(`Selain izin sakit dan kehamilan hanya diizinkan selama ${user.sisa_cuti} hari dari sisa cuti`, {
                extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
            })
            
            console.log(`cronjob akan berjalan untuk cuti ${difference}`)
            await CutiUtilities.triggerCronIzin(cuti, true, difference, user.sisa_cuti);
        } else if (input && input.status_izin === 'diterima' && cuti && !moment(cuti.tanggal_aksi).isBefore(moment(cuti.tanggal_izin))){
            await UserModel.findOneAndUpdate(
                {
                    _id: cuti.user_id,
                    status: "active",
                },
                {
                    $set: {
                        sisa_cuti: user.sisa_cuti - difference,
                        is_cuti: true,
                    },
                }
            );
        }

        let text = input.status_izin === 'diterima' ? 'Selamat, Izin kerja Anda berhasil di setujui oleh Penanggung Jawab, silahkan periksa kembali.' : 'Maaf, Izin kerja Anda ditolak oleh Penanggung Jawab, silahkan periksa kembali.';

        await NotifikasiUtilities.adminAddNewTaskNotif(
            input.status_izin === 'diterima' ? 'notifikasi_cuti_diterima' : 'notifikasi_cuti_ditolak', 
            text, 
            cuti.user_id, 
            null,
            null,
        )
    }


    return cuti
}

const UpdateCuti = async (parent, { input, cuti_id, file }, ctx) => {
    if (!cuti_id) throw new GraphQLError("cuti_id dibutuhkan pencarian cuti", {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });

    const checkCutiMember = await CutiModel.findOne({_id: cuti_id, status: 'active'})
    const checkSisaCuti = await UserModel.findOne({_id: checkCutiMember.user_id});

    const start = moment(input.tanggal_izin, "YYYY-MM-DD");
    const end = moment(input.tanggal_masuk, "YYYY-MM-DD");
    let difference = moment.duration(end.diff(start)).asDays();

    if (input && !['izin_sakit', 'izin_kehamilan'].includes(input.tipe_cuti) && checkSisaCuti.sisa_cuti && checkSisaCuti.sisa_cuti < difference ) throw new GraphQLError(`Selain izin sakit hanya diizinkan selama ${checkSisaCuti.sisa_cuti} hari dari sisa cuti`, {
        extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
    })

    if (!checkCutiMember) throw new GraphQLError("Cuti tidak ditemukan", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
    });

    const checkInput = Object.keys(input).some(val => ['status_izin', 'tanggal_aksi'].includes(val))
    if (checkInput) throw new GraphQLError("Tidak perlu input status_izin dan tanggal_aksi", {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });

    let filePath = '';

    if (file) {
        const { createReadStream, filename } = await file;

        const extention = filename ? filename.split('.') : false;

        if (extention && extention.length && !['pdf'].includes(extention[extention.length - 1])) throw new GraphQLError('File izin harus berekstensi pdf', {
            extensions: { code: "NOT_ACCEPTABLE", http: { status: 406 } },
        })

        filePath = `./static/${filename}`;
        const writeFile = await common.writeFile(createReadStream(), filePath);

        if (writeFile) {
            const data = await UserUtilities.saveImage(filePath);

            input.file_izin = data && data.base64File ? data.base64File : '';
            input.filename = filename
        }
    }

    input.tanggal_izin = input && input.tanggal_izin ? moment(input.tanggal_izin).format('YYYY-MM-DD') : '';
    input.tanggal_masuk = input && input.tanggal_masuk ? moment(input.tanggal_masuk).format('YYYY-MM-DD') : ''

    const cutiUpdate = await CutiModel.findOneAndUpdate(
        { _id: cuti_id , status: "active", status_izin: 'diajukan' },
        { $set: input },
        { new: true }
    );

    if (filePath) {
        await UserUtilities.deleteImages(filePath);
    }

    if (!cutiUpdate) {
        throw new GraphQLError(`Cuti id tidak berstatus diajukan`, {
            extensions: { code: 'BAD_REQUEST', http: { status: 400 } },
        })
    }
    
    return cutiUpdate
};

const UpdatePengaturanCuti = async function (parent, { input }, ctx){
    let instansi_id = ctx.user.instansi_id;
    if (!instansi_id) throw new GraphQLError("instansi_id tidak ada, hubungi tim pengembang", {
        extensions: { code: "BAD_REQUEST", http: { status: 400 } },
    });

    let settingId;
    let pengaturanCuti;
    if (input.setting_id) {
        settingId = input.setting_id;
    } else {
        pengaturanCuti = await SettingModel.findOne({ instansi_id: instansi_id, status: 'active' }).select('_id pengaturan_cuti').lean();
        settingId = pengaturanCuti._id
    }
    
    if (!pengaturanCuti) {
        pengaturanCuti = await SettingModel.findOne({ _id: settingId, status: 'active' }).select('_id pengaturan_cuti').lean();
    }
    
    if (!pengaturanCuti) {
        throw new GraphQLError('pengaturan cuti tidak ditemukan', {
            extensions: { code: "NOT_FOUND", http: { status: 404 } },
        });
    }

    // pengaturan telah ditemukan lanjutkan ke update

    let objectToUpdate = {
        ...input
    }
    
    pengaturanCuti = await SettingModel.findOneAndUpdate({ _id: settingId }, { $set: { pengaturan_cuti: objectToUpdate }}, { new: true }).select('_id pengaturan_cuti') 

    pengaturanCuti.setting_id  = pengaturanCuti._id
    return pengaturanCuti;
}

const DeleteCuti = async (parent, { cuti_id }, ctx) => {
    const deleteCuti = await CutiModel.findOneAndUpdate({ _id: cuti_id, status_izin: 'diajukan' }, 
        {
            $set: {
                status: 'deleted',
                deleted_at: moment().format('DD/MM/YYYY').toString(),
            },
        },{ new: true });

    if (!deleteCuti){
        throw new GraphQLError(`Status izin dari cuti sudah bukan diajukan`, {
            extensions: { code: 'BAD_REQUEST', http: { status: 400 } },
        })
    }

    return deleteCuti
}

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
}

const cutiApproverLoader = async (parent, args, ctx) => {
    try {
        if (parent && parent.cuti_approver && parent.cuti_approver.length) {
            return parent.cuti_approver.map(async (data) => {
                return await UserModel.findOne({_id: data._id});
            });
        }
    } catch (error) {
        console.log('loader cutiApproverLoader error')
    }
}

const forwardDivisiLoader = async (parent, args, ctx) => {
    try {
        if (parent && parent.forward_selected_divisi && parent.forward_selected_divisi.length) {
            return parent.forward_selected_divisi.map(async (data) => {
                return await ctx.divisiLoader.load(data._id)
            });
        }
    } catch (error) {
        console.log('loader forwardDivisiLoader error')
    }
  };

module.exports = {
    Query: {
        GetAllCuti,
        GetOneCuti,
        GetPengaturanCuti
    },
    Mutation: {
        CreateCuti,
        UpdateCuti,
        DeleteCuti,
        UpdatePengaturanCuti
    },
    Cuti: {
        user_id: userLoader,
        aktor_aksi: aksiLoader,
    },
    PengaturanCutiType: {
        cuti_approver: cutiApproverLoader,
        forward_selected_divisi: forwardDivisiLoader
    }
}
