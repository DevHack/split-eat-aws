/**
 * Created by debayan.das on 23-01-2017.
 */
(function () {
    "use strict";
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});

    function isGroupIdExists(ev, cb) {
        let params = {
            Key: {
                groupieId: ev.groupieId
            },
            TableName: "groupie"
        };
        console.log("checking for existing group", ev.groupieId);
        docClient.get(params, function (err, data) {
            if (Object.keys(data).length) {
                console.error("groupieId already exits for", ev.groupieId);
                cb("groupieId already exists: " + ev.groupieId, null);
            } else {
                console.log("creating new groupie for", ev.groupieId);
                updateUsers(ev, cb);
            }
        });

    }

    function updateUsers(ev, cb) {
        for (var i = 0; i < ev.members.length; i++) {
            let currentMember = ev.members[i];
            (function (currentMember, ev) {
                docClient.get({
                    TableName: "user",
                    Key: {
                        userId: currentMember
                    }
                }, function (err, data) {
                    let userObj = data.Item;
                    let groupieObj = {
                        groupieId: ev.groupieId,
                        outstanding: 0
                    };
                    userObj.groupies.push(groupieObj);
                    docClient.put({
                        TableName: "user",
                        Item: userObj
                    }, function (err, data) {
                        if (err) {
                            cb(err, null)
                        } else {
                            console.log("user updated successfully")
                        }
                    })
                });
            }(currentMember, ev));
        }
        createGroupie(ev, cb);
    }

    function createGroupie(ev, cb) {
        let params = {
            Item: {
                groupieId: ev.groupieId,
                groupieName: ev.groupieName,
                members: ev.members
            },
            TableName: "groupie"
        };
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("error creating groupie", err);
                cb(err, null);
            } else {
                console.log("groupie successfully created: " + ev.groupieId);
                cb(null, "Groupie successfully created");
            }
        });
    }

    exports.handle = function (e, ctx, cb) {
        console.log('processing event: %j', e);
        isGroupIdExists(e, cb);
    };
}());