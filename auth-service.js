const mongoose = require('mongoose');
// const userSchema = require('./user-schema');
const bcrypt = require('bcryptjs');
let User;

module.exports.initialize = function (connectionString) {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(connectionString);

        db.on('error', (err) => {
            reject(err);
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            let newUser = new User(userData);
            newUser.save(function (err) {
                if (err) {
                    if (err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject(`There was an error creating the user: ${err}`);
                    }
                } else {
                    resolve();
                }
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName }, function (err, users) {
            if (err) {
                reject(`Unable to find user: ${userData.userName}`);
            } else if (users.length === 0) {
                reject(`Unable to find user: ${userData.userName}`);
            } else if (users[0].password !== userData.password) {
                reject(`Incorrect Password for user: ${userData.userName}`);
            } else {
                let loginTime = (new Date()).toString();
                users[0].loginHistory.push({ dateTime: loginTime, userAgent: userData.userAgent });
                User.update({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } }, function (err) {
                    if (err) {
                        reject(`There was an error verifying the user: ${err}`);
                    } else {
                        resolve(users[0]);
                    }
                });
            }
        });
    });
};
