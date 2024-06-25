const typeDef = require('./user.typedef');
const resolvers = require('./user.resolvers');
// const UserValidator = require('./user.validator');
const UserModel = require('./user.model');
const UserUtilities = require('./user.utilities');
const UserLoader = require('./user.loader');

module.exports = {
    typeDef,
    resolvers,
    UserModel,
    // UserValidator,
    UserUtilities,
    UserLoader,
};
