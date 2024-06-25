const jwt = require('jsonwebtoken');
const userModel = require('../graphql/users/user.model');
const BlacklistModel = require('../graphql/users/blacklist.model');
const FirebaseModel = require('../graphql/messagingFirebase/messaging.model');
const { GraphQLError } = require('graphql');
const dotenv = require('dotenv');
dotenv.config()

const auth = async (res, parent, args, ctx) => {
    try{
        let header = ctx && ctx.token ? ctx.token : null;

        if (!header) throw new GraphQLError('Bearer token invalid, silahkan login kembali', {
            extensions: { code: "UNAUTHORIZED", http: { status: 401 } },
        });

        header = header.replace('Bearer ', '');
    
        const verification = jwt.verify(header, process.env.TOKEN_SECRET, (err, res) => {
            if (err) throw new GraphQLError('Token kadaluarsa, mohon login kembali', {
                extensions: { code: "FORBIDDEN", http: { status: 401 } },
            });
            return res;
        });

        if (!verification) {
            await FirebaseModel.findOneAndUpdate(
                {
                    apps_id: ctx.apps_id,
                    status: 'active'
                },
                {
                    $set: {
                        status: 'deleted'
                    }
                }
            )
            throw new GraphQLError('Authorisasi gagal, pengguna tidak diberi akses data', {
                extensions: { code: "FORBIDDEN", http: { status: 403 } },
            });
        }

        const checkBlackList = await BlacklistModel.findOne({ auth_token: header});
        if (checkBlackList) throw new GraphQLError('Token invalid sebagai blacklist', {
            extensions: { code: "UNAUTHORIZED", http: { status: 401 } },
        });
        
        if (ctx.apps_id) {
            ctx.user_apps_id = ctx.apps_id 
        }
        
        const user = await userModel.findOne({email: verification.email, status: 'active'}).select({url_foto: 0});

        ctx.user = user

        ctx.token = header;
        return res();
    }catch(e) {
        throw new GraphQLError('Kesalahan token, mohon login kembali', {
            extensions: { code: "FORBIDDEN", http: { status: 401 } },
          });
    }
};

module.exports = {
    Query: {
        GetOneUser: auth,
        GetAllPresensi: auth,
        GetOnePresensi: auth,
        GetAllUser: auth,
        GetOneTask: auth,
        GetAllTasks: auth,
        GetAllUsersType: auth,
        GetAllDivisi: auth,
        GetAllCuti: auth,
        GetOneSetting: auth,
        GetAllSettings: auth,
        GetAllInventarisKendaraan: auth,
        GetOneInstansi: auth,
        GetOneInventarisKendaraan: auth,
        GetAllTipeIdentitas: auth,
        GetProfileImage: auth,
        GetAllCancelBySystem: auth,
        GetAllApotik: auth,
        GetOneFotoPresensi: auth,
        GetOneFotoPendukung: auth,
        GetOneFotoBukti: auth,
        GetOneFotoPlakat: auth,
        GetAllKunjungan: auth,
        GetDetailKunjungan: auth,
        GetDetailPerjalanan: auth,
        GetDashboardInform: auth,
        GetAllNotifikasi: auth,
        GetGroupOfTask: auth,
        GetAllPermissions: auth,
        GetAllTaskReport: auth,
        GetAllUserInTaskReport: auth,
        getTotalApotik: auth,
        GetTotalUser: auth,
        GetTotalInventarisKendaraan: auth,
        SelectAllPresensi: auth,
        GetGenderDiversity: auth,
        GetAllPresensiStatistic: auth,
        GetDivisiPresentation: auth,
        GetEmployDiversity: auth,
        GetDefaultDaysOff: auth,
        CheckAvaliableKategoriCutiName: auth,
        GetAllKategoriCuti: auth,
        GetAllKategoriCutiResponsible: auth,
        SelectAllKategoriCuti: auth,
        GetAllPresensiAllDays: auth,
        CountParameterUser: auth,
        GetPengaturanCuti: auth,
        getAllLokasiPresensi: auth,
    },
    Mutation: {
        CreateTasks: auth,
        AddInventarisKendaraan: auth,
        UpdateInventarisKendaraan: auth,
        DeleteInventarisKendaraan: auth,
        // CreateInstansi: auth,
        UpdateInstansi: auth,
        DeleteInstansi: auth,
        CreateUserByAdmin: auth,
        AddContact: auth,
        AddDivisi: auth,
        UpdateDivisi: auth,
        DeleteDivisi: auth,
        Logout: auth,
        UploadImage: auth,
        CreatePresensi: auth,
        UpdateProfile: auth,
        UpdatePresensi: auth,
        DeletePresensi: auth,
        CreateUserType: auth,
        DeleteUserType: auth,
        DeleteUser: auth,
        ActiveUser: auth,
        UpdateUserType: auth,
        CreateTypeIdentity: auth,
        UpdateTipeIdentity: auth,
        UpdateTipeIdentity: auth,
        CreateOrUpdateSetting: auth,
        DeleteTasks: auth,
        UpdateTasks: auth,
        CompletedATask: auth,
        CreateCuti: auth,
        AddApotikAsManual: auth,
        ImportUser: auth,
        DeleteActivityOnTask: auth,
        DeleteCancelBySystem: auth,
        checkUtilitiesCron: auth,
        checkCronNotifikasi: auth,
        CreateApotik: auth,
        ImportApotik: auth,
        saveDeviceAppsID: auth,
        dummyNotif: auth,
        TaskDailyDefault: auth,
        ConfirmationApotikIsConsumt: auth,
        readThisNotif: auth,
        ReimbursementConf: auth,
        DeleteNotifikasi: auth,
        CreatePermission: auth,
        CreateKategoriCuti: auth,
        ExportLogPresensiAllDays: auth,
        UpdatePengaturanCuti: auth,
        createLokasiPresensi: auth,
    }
}