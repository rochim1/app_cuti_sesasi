const UserUtilities = require("./user.utilities");
const { GraphQLError } = require("graphql");
const { UserModel } = require(".");

/**
 * this function is for register user
 *
 * @param {*} parent
 * @param {*} {
 *   input
 * }
 * @param {*} ctx
 */
const CreateUser = async (parent, { input }, ctx) => {
  try {
    return await UserUtilities.createUser(input, ctx);
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const CreateUserByAdmin = async (parent, { input }, ctx) => {
  try {
    return await UserUtilities.createUserByAdmin(input, ctx);
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const Login = async (parent, { input }, ctx) => {
  try {
    let loginData = await UserUtilities.login(input, ctx);
    return loginData;
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const GetOneUser = async (parent, { _id }, ctx) => {
  try {
    return await UserUtilities.GetOneUser(_id)
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const ConfirmUser = async (parent, { id_user }, ctx) => {
  try {
    return await UserUtilities.confirmUser(id_user, ctx)
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const Logout = async (parent, args, ctx) => {
  try {
    return await UserUtilities.logout(ctx);
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const GetAllUser = async (parent, { filter, sorting, pagination }, ctx) => {
  try {
    return await UserUtilities.getAllUser(filter, sorting, pagination, ctx);
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

const UpdateUser = async (parent, { id_user, input }, ctx) => {
  try {
    return await UserUtilities.editUser(id_user, input, ctx);
  } catch (error) {
    throw new GraphQLError(`Error, ${error}`, {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
};

module.exports = {
  Query: {
    GetOneUser,
    GetAllUser,
  },
  Mutation: {
    CreateUser,
    Login,
    UpdateUser,
    Logout,
    CreateUserByAdmin,
    ConfirmUser
  },
};
