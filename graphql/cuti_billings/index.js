const typeDef = require('./cuti_billings.typedef');
const resolvers = require('./cuti_billings.resolvers');
// const UserValidator = require('./user.validator');
const CutiBillingsModel = require('./cuti_billings.model');
const CutiBillingsUtilities = require('./cuti_billings.utilities');
const CutiBillingsLoader = require('./cuti_billings.loader');

module.exports = {
    typeDef,
    resolvers,
    CutiBillingsModel,
    CutiBillingsUtilities,
    CutiBillingsLoader
};
