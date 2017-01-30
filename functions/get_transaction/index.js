/**
 * Created by debayan.das on 25-01-2017.
 */
(function () {
    "use strict";
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});


    exports.handle = function (e, ctx, cb) {
        console.log('processing event: %j', e);
        console.log(e.groupieId);
        let params = {
            TableName: "transaction",
            FilterExpression: "groupieid = :groupieId",
            ExpressionAttributeValues: {
                ":groupieId": e.groupieId
            }
        };
        console.log("checking for transaction for groupieId", e.groupieId);
        docClient.scan(params, function (err, data) {
            console.log(data);
            if (!data && !Object.keys(data).length) {
                console.error("no transaction exists for", e.groupieId);
                cb("no transaction exists: " + e.groupieId, null);
            } else {
                console.log("sending transactions for ", e.groupieId);
                cb(null, data.Items);
            }
        });
    };
}());