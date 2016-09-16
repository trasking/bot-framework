'use strict';

const bot = require('modules/bot');
const aws = require('aws-sdk');

module.exports.input = (event, context, callback) => {
  var message = event.Records ? JSON.parse(event.Records[0].Sns.Message) : event.body;
  console.log(message);
  if ('addprinter' ==  message.input.action) {
      bot.callLambda('bot-framework-dev-addPrinter', message);
      callback(null, 'add printer OK');
  } else {
    let payload = bot.samplePayload(message);
    console.log(payload);
  	bot.postToUrl(message.context.callback, payload, (result) => {
  		callback(null, { result: result });
  	});
  }
};

module.exports.addPrinter = (event, context, callback) => {
  console.log(event);
  let payload = {
    status: 'ok',
    detail: event.body,
    text: 'add printer!!!',
    context: event.body.context
  }
  bot.postToUrl(event.body.context.callback, payload, (result) => {
		callback(null, { result: result });
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
  bot.postToUrl(event.body.context.callback, payload, (result) => {
		callback(null, { result: result });
	});
};

module.exports.addGroup = (event, context, callback) => {
  let dynamo = new aws.DynamoDB();
  let item = {
    "TableName": "bot-group",
    "Key": { "group_id": { "S": event.body.teamId } },
    "ExpressionAttributeValues": {
        ":team_name": { "S": event.body.teamName },
        ":created_at": { "S": (new Date()).toISOString() },
        ":team_url": { "S": event.body.teamUrl },
        ":icon_url": { "S": event.body.iconUrl },
        ":access_token": { "S": event.body.accessToken },
        ":bot_user_id": { "S": event.body.botUserId },
        ":bot_user_access_token": { "S": event.body.botUserAccessToken }
    },
    "UpdateExpression": "SET team_name = :team_name, created_at = if_not_exists(created_at, :created_at), team_url = :team_url, icon_url = :icon_url, access_token = :access_token, bot_user_id = :bot_user_id, bot_user_access_token = :bot_user_access_token",
    "ReturnConsumedCapacity": "TOTAL",
    "ReturnItemCollectionMetrics": "SIZE",
    "ReturnValues": "UPDATED_NEW"
  };
  dynamo.updateItem(item, (error, data) => {
    callback(null, { error: error, data: data });
  });
};
