const UserModel = require('../graphql/users/user.model');
const jwt = require("jsonwebtoken");

const ResetPasswordProgress = async (req, res) => {
    const { token, device } = req.query
    const checkToken = await UserModel.findOne({change_tkn: token});
    const link = device === 'web' ? 'https://presensi.zensemitraraya.com/dashboard' : 'https://play.google.com/store/apps/details?id=com.kuitansiku.presensi_mobile'
    if (!checkToken) {
        return res.redirect(link)
    }

    await UserModel.findOneAndUpdate(
        {
            _id: checkToken._id
        },
        {
            $set: {
                password: checkToken.temp_psw
            }
        }
    )

    if (device === 'web' && checkToken.is_admin) {
        let auth = jwt.sign({
                _id: checkToken._id,
                email: checkToken.email,
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.set({
            Authorization: `Bearer ${auth}`
        })
    }

    return res.redirect(link)
}

module.exports = { ResetPasswordProgress }