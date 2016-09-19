'use strict';

const bot = require('modules/bot');
const aws = require('aws-sdk');
const request = require('request');

module.exports.input = (event, context, callback) => {
  var message = event.Records ? JSON.parse(event.Records[0].Sns.Message) : event.body;
  console.log('INPUT', message);
  bot.processGroup(message, (groupError, groupData) => {
    console.log('GROUP: ', groupError, groupData);
    if ('ok' == groupData.status) {
      message.context.group = groupData.group;
    }
    bot.processUser(message, (userError, userData) => {
        console.log('USER: ', userError, userData);
        if ('ok' == userData.status) {
          message.context.user = userData.user;
        } else {
          console.log("USER NOT OK", userData);
        }

        // process input here

        let payload = bot.samplePayload(message);
        request({
          method: 'POST',
          url: `${message.context.service_endpoint}/callback`,
          body: payload,
          json: true
        }, (error, response, data) => {
          var responseInfo = response ? `${response.statusCode} ${response.statusMessage}` : null;
          var returnValue = { error: error, response: responseInfo, data: data }
          console.log('CALLBACK', returnValue);
          callback(null, returnValue);
        });
    });
  });
};

module.exports.addPrinter = (event, context, callback) => {
  console.log(event);
  let payload = {
    status: 'ok',
    detail: event.body,
    text: 'add printer!!!',
    context: event.body.context
  }

  request({
    method: 'POST',
    url: event.body.context.callback,
    body: payload,
    json: true
  }, (error, response, data) => {
    callback(null, { error: error, response: response, data: data });
  });
};

module.exports.addUser = (event, context, callback) => {
  console.log(event);
  let payload = {
    status: 'ok',
    detail: event.body,
    text: 'add user!!!',
    context: event.body.context
  }
  request({
    method: 'POST',
    url: event.body.context.callback,
    body: payload,
    json: true
  }, (error, response, data) => {
    callback(null, { error: error, response: response, data: data });
  });
};

module.exports.addGroup = (event, context, callback) => {
  console.log(event);
  let dynamo = new aws.DynamoDB();
  let item = {
    "TableName": "bot-group",
    "Key": { "group_id": { "S": event.body.team_id } },
    "ExpressionAttributeValues": {
        ":team_name": { "S": event.body.team_name },
        ":team_domain": { "S": event.body.team_domain },
        ":team_icon": { "S": event.body.team_icon },
        ":team_access_token": { "S": event.body.team_access_token },
        ":bot_user_id": { "S": event.body.bot_user_id },
        ":bot_access_token": { "S": event.body.bot_access_token },
        ":current_date_time": { "S": (new Date()).toISOString() }
    },
    "UpdateExpression": "SET team_name = :team_name, created_at = if_not_exists(created_at, :current_date_time), updated_at = :current_date_time, team_domain = :team_domain, team_icon = :team_icon, team_access_token = :team_access_token, bot_user_id = :bot_user_id, bot_access_token = :bot_access_token",
    "ReturnConsumedCapacity": "TOTAL",
    "ReturnItemCollectionMetrics": "SIZE",
    "ReturnValues": "UPDATED_NEW"
  };
  dynamo.updateItem(item, (error, data) => {
    callback(null, { error: error, data: data });
  });
};
