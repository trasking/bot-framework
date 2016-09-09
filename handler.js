'use strict';

const bot = require('bot');

// const aws = require('aws-sdk');

module.exports.input = (event, context, callback) => {
    let responseBody = {
    	status: 'ok',
    	detail: 'example',
    	responses: [ { primaryText: 'This is the primary text.'} ],
    	context: event.body.context
    }
	bot.postToUrl(event.body.context.callbackUrl, responseBody, (result) => {
		callback(null, { function: 'input', result: result });	
	});
};

// let callLambda = (functionName, event) => {
//     let lambda = new aws.Lambda({ region: 'us-west-2' });
//     let params = {
//         FunctionName: functionName,
//         InvocationType: 'Event',
//         LogType: 'None',
//         Payload: JSON.stringify(event)
//     };
//     lambda.invoke(params, (error, data) => {
//         if (error) {
//             console.log("ERROR: ", error);
//         }
//     });  
// };