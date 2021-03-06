'use strict'

const https = require('https');
const uri = require('url');
const aws = require('aws-sdk');
const request = require('request');

module.exports.processGroup = (group_id, callback) => {
  let dynamo = new aws.DynamoDB();
  let params = {
    TableName: 'bot-group',
    Key: { group_id: { S: group_id } }
  };
  dynamo.getItem(params, (error, data) => {
    if (error) {
      callback(null, { status: 'error', detail: error });
    } else if (!data.Item) {
      callback(null, { status: 'error', detail: `group not found: ${group_id}`})
    } else {
      callback(null, { status: 'ok', group: objectFromAttributes(data.Item) });
    }
  });
};

module.exports.processUser = (message, callback) => {
  if (message.context.user && message.context.user.user_id) {
    let dynamo = new aws.DynamoDB();
    let params = {
      TableName: 'bot-user',
      Key: { user_id: { S: message.context.user.user_id } }
    };
    dynamo.getItem(params, (getError, getResult) => {
      if (getResult.Item) {
        console.log('USER EXISTS');
        callback(null, { status: 'ok', user: objectFromAttributes(getResult.Item) });
      } else {
        console.log('ASKING SERVICE FOR USER INFO');
        request({
          method: 'GET',
          url: `${message.context.service_endpoint}/user`,
          headers: { "x-bot-context": JSON.stringify(message.context) }
        }, (serviceError, serviceResponse, serviceResult) => {
          console.log('SERVICE RESULT', serviceResult);
          let serviceData = JSON.parse(serviceResult);
          console.log('SERVICE DATA', serviceData);
          if ('ok' == serviceData.status) {
            saveUser(serviceData.user, (updateError, updateResult) => {
              console.log('SAVE RESULT', updateError, updateResult);
              if (updateError) {
                callback(null, { status: 'error', detail: updateError });
              } else if (!data.Attributes) {
                callback(null, { status: 'error', detail: `user not found: ${message.context.user.user_id}`})
              } else {
                callback(null, { status: 'ok', user: objectFromAttributes(data.Attributes) });
              }
            });
          } else {
            callback(null, serviceData);
          }
        });
      }
    });
  } else {
    callback(null, { status: 'missing', detail: 'Input does not incude a user'});
  }
};

var saveUser = (user, callback) => {
  console.log('SAVING USER', user);
  let dynamo = new aws.DynamoDB();
  let item = {
    TableName: "bot-user",
    Key: { user_id: { S: user.user_id } },
    ReturnValues: "ALL_NEW",
    ExpressionAttributeValues: {
      ":current_date_time": { S: (new Date()).toISOString() }
    },
    UpdateExpression: "SET created_at = if_not_exists(created_at, :current_date_time), updated_at = :current_date_time"
  };
  Object.keys(user).forEach(function(key) {
    if ('user_id' != key) {
      item.ExpressionAttributeValues[`:${key}`] = { S: user[key] };
      item.UpdateExpression += `, ${key} = :${key}`;
    }
  });
  console.log('SAVE ITEM', item)
  dynamo.updateItem(item, (error, data) => {
    callback(error, data);
  });
};

module.exports.callLambda = (functionName, payload) => {
    // console.log(functionName, payload);
    // return;
    let lambda = new aws.Lambda({ region: 'us-west-2' });
    let params = {
        FunctionName: functionName,
        InvocationType: 'Event',
        LogType: 'None',
        Payload: JSON.stringify(payload)
    };
    lambda.invoke(params, (error, data) => {
        if (error) {
            console.log("ERROR: ", error);
        }
    });
};

module.exports.samplePayload = (message) => {

	return {
    	status: 'ok',
    	detail: message.input,
    	text: 'This is the primary text reply or the lead in text for list of items',
    	items: [
    		{
    			color: '#00FF00',
    			basic_text: 'This item text is for bare-bones clients',
    			title_text: 'Shown in the title area',
    			subtitle_text: 'Shown in the subtitle area',
                footer_text: 'This is the footer',
                image: 'https://farm9.staticflickr.com/8171/8028156532_4717b2be77_s.jpg',
    			text_fields: [
	    			{
						title: 'Slack Command',
	    				text: message.input.action
	    			},
	    			{
	    				title: 'Command Text',
	    				text: message.input.text
	    			}
    			],
    			actions: [
    				{
    					type: 'button',
                        id: 'action_1',
    					text: 'Button text',
    					payload: { fake: 'payload' },
    					default: true
    				},
    				{
    					type: 'button',
                        id: 'action_2',
    					text: 'Another button',
    					payload: { fake: 'payload' }
    				}
    			]
    		},
        {
            color: '#0000FF',
            basic_text: 'This item text is for bare-bones clients',
            title_text: 'Shown in the title area',
            subtitle_text: 'Shown in the subtitle area',
            footer_text: 'This is the footer',
            image: 'https://img1.etsystatic.com/053/0/8863163/il_75x75.688855889_pehc.jpg',
            text_fields: [
                {
                    title: 'Sample',
                    text: 'Just a sample field'
                }
            ]
        }
    	],
    	context: message.context
    };

};

let objectFromAttributes = (attributes) => {
  let object = {};
  Object.keys(attributes).forEach(function(key) {
    var value = attributes[key]["S"] ? attributes[key]["S"] : attributes[key]["SS"];
    object[key] = value;
  });
  return object;
};
