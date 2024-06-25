const { UserLoader } = require('../graphql/users/user.loader');
const { UserTypeLoader } = require('../graphql/userTypes/userType.loader');

module.exports = {
    loaders: () => {
        return {
            UserLoader: UserLoader(),
            UserTypeLoader: UserTypeLoader()
        };
    },
};
