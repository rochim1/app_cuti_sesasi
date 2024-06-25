const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const BlackListSchema = new Schema({
    auth_token: {
        type: String
    }
}, {timeseries: true})

module.exports = mongoose.model('blacklist', BlackListSchema);