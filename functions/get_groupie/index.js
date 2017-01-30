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
                groupieId: e.groupieId
            },
            TableName: "groupie"
        };
        console.log("checking for existing groupie", e.groupieId);
        docClient.get(params, function (err, data) {
            let groupDetails = {};
            if (!Object.keys(data).length) {
                console.error("groupie does not exits for", e.groupieId);
                cb("groupie does not exists: " + e.groupieId, null);
            } else {
                console.log("sending user for", e.groupieId);
                groupDetails = data.Item;
                groupDetails.outstanding = [];
                docClient.scan({
                    TableName: "user",
                    FilterExpression: "contains(:id,#id)",
                    ExpressionAttributeNames: {
                        "#id": "userId"
                    },
                    ExpressionAttributeValues: {
                        ":id": groupDetails.members
                    },
                    ProjectionExpression: "username, userId, groupies"
                }, function (err, data) {
                    console.log(data);
                    let users = data.Items;
                    for (let i = 0; i < users.length; i++) {
                        let user = users[i];
                        let outstanding = user.groupies.map(function (elm) {
                            if (elm.groupieId === e.groupieId) {
                                return elm.outstanding;
                            }
                        });
                        user.outstanding = outstanding[0];
                        delete user.groupies;
                        groupDetails.outstanding.push(user);
                    }
                    delete groupDetails.members;
                    cb(null, groupDetails);
                });
            }
        });
    };
}());