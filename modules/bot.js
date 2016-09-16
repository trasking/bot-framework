'use strict'

const https = require('https');
const uri = require('url');
const aws = require('aws-sdk');

module.exports.addUserToGroup => (user, group, callback) => {
  let dynamo = new aws.DynamoDB();
  let item = {
    "TableName": "bot-group",
    "Key": { "group_id": { "S": group } },
    "ExpressionAttributeValues": {
        ":user": { "S": user }
    },
    "CondtionExpression": "NOT(contains(users, :user))",
    "UpdateExpression": "ADD users [:user]",
    "ReturnConsumedCapacity": "TOTAL",
    "ReturnItemCollectionMetrics": "SIZE",
    "ReturnValues": "ALL_NEW"
  };
  dynamo.updateItem(item, (error, data) => {
    callback(error, data);
  });
}

module.exports.postToUrl = (url, body, callback) => {
    let parts = uri.parse(url);
    let options = {
        hostname: parts.hostname,
        port: parts.port,
        path: parts.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
    };
    let req = https.request(options, function(res) {
    	let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);
        res.on('error', (error) => callback({ status: res.statusCode, error: error }));
        res.on('end', () => callback({ status: res.statusCode, body: body }));
    });
    req.write(JSON.stringify(body));
    req.end();
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
