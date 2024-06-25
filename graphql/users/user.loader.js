const DataLoader = require('dataloader');
const UserModel = require('./user.model');

const batchUser = async (userIds) => {
    const users = await UserModel.find({
        _id: {
            $in: userIds //array
        },
        status: 'active'
    });
    let obj = {};
    users.forEach(val => {
        obj[val._id] = val
    })

    return userIds.map(val=> obj[val]);
}

module.exports = new DataLoader(batchUser);