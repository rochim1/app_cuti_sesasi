const { merge } = require('lodash');
const { GraphQLUpload } = require('graphql-upload-minimal');
const users = require('./users');
const wilayah = require('./wilayah');
const cuti = require('./cuti');
const kategoriCuti = require('./kategori_cuti');
const cutiBillings = require('./cuti_billings');

const typeDef = `
  scalar Upload
  type Query
  type Mutation
`;

const typeDefs = [
    typeDef,
    users.typeDef,
    // wilayah.typeDef,
    // cuti.typeDef,
    kategoriCuti.typeDef,
    // cutiBillings.typeDef,
];

let resolvers = {
    Upload: GraphQLUpload,
};

resolvers = merge(
    resolvers,
    users.resolvers,
    // wilayah.resolvers,
    // cuti.resolvers,
    kategoriCuti.resolvers,
    // cutiBillings.resolvers,
);

module.exports = {
    typeDefs,
    resolvers,
    userLoader: users.UserLoader,
    // cutiLoader: cuti.CutiLoader,
    kategoriCutiLoader: kategoriCuti.kategoriCutiLoader,
    // cutiBillingsLoader: cutiBillings.CutiBillingsLoader,
};
