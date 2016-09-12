'use strict';

const bot = require('bot');

module.exports.input = (event, context, callback) => {
  console.log(event);
  if ('addprinter' ==  event.body.input.action) {
      bot.callLambda('bot-framework-dev-addPrinter', event);
      callback(null, 'add printer OK');
  } else {
    let payload = getPayload(event);
    console.log(payload);
  	bot.postToUrl(event.body.context.callback, payload, (result) => {
  		callback(null, { function: 'input', result: result });
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
		callback(null, { function: 'input', result: result });
	});
};

let getPayload = (event) => {

	return {
    	status: 'ok',
    	detail: event.body.input,
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
    	context: event.body.context
    };

};
