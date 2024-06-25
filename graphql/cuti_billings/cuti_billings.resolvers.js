const CutiBillingModel = require('./cuti_billings.model');
const moment = require("moment");
const {
    GraphQLError
} = require("graphql");
const CutiBillingUtillities = require('./cuti_billings.utilities')
const common = require('../../utils/common');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const UserModel = require("../users/user.model")

//***** Query*/  
const getAllCutiBillings = async function (parent, {
    filter,
    sorting,
    pagination
}, ctx) {

}

const getCutiBillings = async function (parent, { filter }, ctx) {

}

const updateCutiBilling = async function (parent, { _id, input}, ctx) {

}


//***** Loader */

const userLoader = async (parent, args, ctx) => {
    if (parent && parent.user_id) {
        return await ctx.userLoader.load(parent.user_id);
    }
}

module.exports = {
    Query: {
        getAllCutiBillings,
        getCutiBillings
    },
    Mutation: {
        updateCutiBilling
    },
    CutiBilling: {
        user_id: userLoader
    }
}