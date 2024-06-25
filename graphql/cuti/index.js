const typeDef = require('./cuti.typedef');
const resolvers = require('./cuti.resolvers');
// const UserValidator = require('./user.validator');
const CutiModel = require('./cuti.model');
const CutiUtilities = require('./cuti.utilities');
const CutiLoader = require('./cuti.loader');

module.exports = {
    typeDef,
    resolvers,
    CutiModel,
    CutiUtilities,
    CutiLoader
};
