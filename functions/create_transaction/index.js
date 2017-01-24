/**
 * Created by debayan.das on 23-01-2017.
 */
(function () {
    "use strict";
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({region: "us-west-2"});

    function getTransactionId(ev, cb) {
        var params = {
            TableName: "transaction",
            Select: "COUNT"
        };
        docClient.scan(params, function (err, data) {
            if (err) {
                console.error("error fetching count");
                cb(err, null);
            } else {
                let newTransactionId = data.Count + 1;
                updateUsers(newTransactionId, ev, cb);
            }
        });
    }

    function getTotalCost(costObj) {
        let totalCost = 0;
        for (let i = 0; i < costObj.length; i++) {
            totalCost += costObj[i].paidAmount;
        }
        return totalCost;
    }

    function getPaidAmount(costObj, participantId) {
        let paidAmount = 0;
        costObj.map(function (elm) {
            if (elm.payee === participantId) {
                paidAmount = elm.paidAmount;
            }
        });
        return paidAmount;
    }

    function saveTransaction(transactionId, ev, cb) {
        let transaction = {};
        transaction.transactionId = transactionId;
        transaction.transactionDate = ev.transactionDate;
        transaction.description = ev.description;
        transaction.participants = ev.participants;
        transaction.cost = ev.cost;
        transaction.groupieid = ev.groupieId;

        docClient.put({
            TableName: "transaction",
            Item: transaction
        }, function (err, data) {
            if (err) {
                cb(err, null);
            } else {
                cb(null, data);
            }
        });
    }

    function updateUsers(transactionId, ev, cb) {
        let totalCost = getTotalCost(ev.cost),
            noOfParticipants = ev.participants.length;
        let costPerParticipant = totalCost / noOfParticipants;
        for (var i = 0; i < noOfParticipants; i++) {
            let currentParticipant = ev.participants[i],
                participantCost = -costPerParticipant + getPaidAmount(ev.cost, currentParticipant);
            (function (participantCost, ev) {
                docClient.get({
                    TableName: "user",
                    Key: {
                        userId: currentParticipant
                    }
                }, function (err, data) {
                    let userObj = data.Item;
                    let userGroups = userObj.groupies;
                    let currentGroup;
                    for (let i = 0; i < userGroups.length; i++) {
                        if (userGroups[i].groupieid === ev.groupieid) {
                            currentGroup = userGroups[i];
                            break;
                        }
                    }
                    currentGroup.outstanding += participantCost;
                    docClient.put({
                        TableName: "user",
                        Item: userObj
                    }, function (err) {
                        if (err) console.log('Error on save transaction!');
                        console.log("user updated successfully");
                    });
                });
            }(participantCost, ev));
        }
        saveTransaction(transactionId, ev, cb);
    }

    exports.handle = function (e, ctx, cb) {
        console.log('processing event: %j', e);
        getTransactionId(e, cb);
    };
}());