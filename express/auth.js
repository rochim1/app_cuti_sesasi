const UserModel = require('../graphql/users/user.model');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const verify = jwt.verify(token, process.env.TOKEN_SECRET)
        const user = await UserModel.findOne({email: verify.email, status: 'active'})
        if(!user){
            return res.status(404).send({
                status: false,
                message: 'Pengguna tidak diizinkan, proses dibatalkan'
            })
        }
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