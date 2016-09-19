'use strict'

const https = require('https');
const uri = require('url');
const aws = require('aws-sdk');

module.exports.processGroup = (message, callback) => {
  if (message.context.group && message.context.group.group_id) {
    let dynamo = new aws.DynamoDB();
    let params = {
      TableName: 'bot-group',
      Key: { group_id: { S: message.context.group.group_id } }
    };
    if (message.context.user && message.context.user.user_id) {
      params.ExpressionAttributeValues = { ":user": { SS: [ message.context.user.user_id ] } };
      params.ConditionExpression = "NOT(contains(members, :user))";
      params.UpdateExpression = "ADD members :user";
      params.ReturnValues = "ALL_NEW";
      dynamo.updateItem(params, (error, data) => {
        console.log('RESPONSE updateItem(bot-group)', error, data);
        callback(error, { status: 'ok', group: objectFromAttributes(data.Attributes) });
      });
    } else {
      dynamo.getItem(params, (error, data) => {
        console.log('RESPONSE getItem(bot-group)', error, data);
        callback(error, { status: 'ok', group: objectFromAttributes(data.Item) });
      });
    }
  } else {
    callback(null, { status: 'missing', detail: 'Input does not incude a group'});
  }
}

module.exports.processUser = (message, callback) => {
  if (message.context.user) {
    let dynamo = new aws.DynamoDB();
    let params = {
      TableName: 'bot-user',
      Key: { "user_id": { "S": message.context.user.user_id } }
    };
    dynamo.getItem(params, (error, data) => {
      console.log('RAW USER RESPONSE', error, data);
      callback(error, { status: 'ok', user: objectFromAttributes(data.Item) });
    });
  } else {
    callback(null, { status: 'missing', detail: 'Input does not incude a user'});
  }
}

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
