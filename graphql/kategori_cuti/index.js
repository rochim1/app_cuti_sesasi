const typeDef = require('./kategori_cuti.typedef');
const resolvers = require('./kategori_cuti.resolvers');
// const UserValidator = require('./user.validator');
const CutiModel = require('./kategori_cuti.model');
const CutiUtilities = require('./kategori_cuti.utilities');
const CutiLoader = require('./kategori_cuti.loader');

module.exports = {
    typeDef,
    resolvers,
    CutiModel,
    CutiUtilities,
    CutiLoader
};
