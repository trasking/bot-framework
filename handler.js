'use strict';

const bot = require('bot');

// const aws = require('aws-sdk');

module.exports.input = (event, context, callback) => {
    
    let payload = getPayload(event);

    console.log(payload);

	bot.postToUrl(event.body.context.callbackUrl, payload, (result) => {
		callback(null, { function: 'input', result: result });	
	});
};


let getPayload = (event) => {

	return {
    	status: 'ok',
    	detail: event.body.input,
    	text: 'This is the primary text replay or the lead in text for list of items',
    	items: [
    		{ 
    			color: '#00FF00',
    			basic_text: 'This text is for bare-bones clients',
    			title_text: 'Shown in the title area',
    			subtitle_text: 'Shown in the subtitle area',
    			text_fields: [
	    			{
						title: 'Slack Command',
	    				text: event.body.input.action
	    			},
	    			{
	    				title: 'Command Text',
	    				text: event.body.input.text
	    			}	
    			],
    			actions: [
    				{
    					type: 'button',
    					text: 'Button text',
    					payload: { fake: 'payload' },
    					default: true
    				},
    				{
    					type: 'button',
    					text: 'Another button',
    					payload: { fake: 'payload' }
    				}
    			]
    		} 
    	],
    	context: event.body.context
    };

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