const express = require("express");
const auth = require('./auth');
const userUtillities = require("../graphql/users/user.utilities")
const app = express();
app.use(express.json());
// contoh penggunaan express js
app.post('/sesasi/login', async (req,res) => {
    try {
        let result = await userUtillities.login(req && req.body ? req.body : null)
        res.status(200).send({
            status: true,
            code: 200,
            message: 'Berhasil',
            data: result
        });
    } catch (error) {
        errorHandleing(req, res, error)
    }
});
app.post('/sesasi/create_user', async (req, res) => {
    try {
        let result = await userUtillities.createUser(req && req.body ? req.body : null, null)
        res.status(200).send({
            status: true,
            code: 200,
            message: 'Berhasil',
            data: result
        });
    } catch (error) {
        errorHandleing(req, res, error)
    }
});
app.post('/sesasi/create_verifikator', auth, async (req, res) => {
    try {
        let result = await userUtillities.createUserByAdmin(req && req.body ? req.body : null, { user: req && req.user ? req.user : null});
        
        res.status(200).send({
            status: true,
            code: 200,
            message: 'Berhasil',
            data: result
        });
    } catch (error) {
        errorHandleing(req, res, error)
    }
});

const errorHandleing = (req, res, error) => {
    const errorCode = error.extensions && error.extensions.http && error.extensions.http.status ? error.extensions.http.status : 500;
    const stringCode = error.extensions && error.extensions.code ? error.extensions.code : "INTERNAL_SERVER_ERROR";
    res.status(errorCode).send({
        status: false,
        code: errorCode,
        message: error.message ? error.message: 'error',
        data: stringCode
    });
}

module.exports = app