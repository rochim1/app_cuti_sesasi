const UserModel = require('../graphql/users/user.model');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try{
        if (!req.header('Authorization')) {
            return res.status(403).send({
                status: false,
                error_code: 403,
                message: 'Anda belum login'
            })
        }

        const token = req.header('Authorization').replace('Bearer ', '');
        const verify = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await UserModel.findOne({email: verify.email, status: 'active'})
        if(!user){
            return res.status(404).send({
                status: false,
                message: 'Pengguna tidak diizinkan, proses dibatalkan'
            })
        }
        
        console.log(user)
        req.user = user
        next()
    }catch(e){
        return res.status(401).send({
            status:false,
            message: e.message
        })
    }
}

module.exports = auth