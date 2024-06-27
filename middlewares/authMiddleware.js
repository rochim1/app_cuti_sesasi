const jwt = require('jsonwebtoken');
const userModel = require('../graphql/users/user.model');
const BlacklistModel = require('../graphql/users/blacklist.model');
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
        GetAllUser: auth,
        GetOneCuti: auth,
    },
    Mutation: {
        CreateUserByAdmin: auth,
        UpdateUser: auth,
        CreateKategoriCuti: auth,
        UpdateKategoriCuti: auth,
        DeleteKategoriCuti: auth,
        CreateCuti: auth,
        Logout: auth,
        UpdateCuti: auth,
        DeleteCuti: auth,
    }
}