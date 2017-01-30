/**
 * Created by debayan.das on 25-01-2017.
 */
(function () {
    "use strict";
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});

    
    exports.handle = function (e, ctx, cb) {
        console.log('processing event: %j', e);
        let params = {
            Key: {
                userId: e.userId
            },
            TableName: "user"
        };
        console.log("checking for existing user", e.userId);
        docClient.get(params, function (err, data) {
            if (!Object.keys(data).length) {
                console.error("user does not exits for", e.userId);
                cb("user does not exists: " + e.userId, null);
            } else {
                console.log("sending user for", e.userId);
                console.log(data.Item);
                delete data.Item.password;
                cb(null, data.Item);
            }
        });
    };
}());