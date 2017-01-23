/**
 * Created by debayan.das on 23-01-2017.
 */
(function () {
    "use strict";
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});

    function isUserNameExists(ev, cb) {
        let params = {
            Key: {
                userId: ev.userId
            },
            TableName: "user"
        };
        console.log("checking for existing user", ev.userId);
        docClient.get(params, function (err, data) {
            if (Object.keys(data).length) {
                console.error("user already exits for", ev.userId);
                cb("userId already exists: " + ev.userId, null);
            } else {
                console.log("creating new user for", ev.userId);
                createUser(ev, cb);
            }
        });

    }

    function createUser(ev, cb) {
        let params = {
            Item: {
                userId: ev.userId,
                username: ev.username,
                groupies: [],
                password: ev.password
            },
            TableName: "user"
        };
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("error creating user", err);
                cb(err, null);
            } else {
                console.log("user successfully created: " + ev.userId);
                cb(null, "User successfully created");
            }
        });
    }

    exports.handle = function (e, ctx, cb) {
        console.log('processing event: %j', e);
        isUserNameExists(e, cb);
    };

}());