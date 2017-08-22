'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

app.post('/webhook', function (req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }
});

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "FB_PAGE_ACCESS_TOKEN"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

var engaged = false;
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at %d with message:",
	senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;

	if (messageText) {
		// If we receive a text message, check to see if it matches a keyword
		// and send back an answer. Otherwise, ask the question again.
		if (messageText.toLowerCase().includes("magicball") ||
		messageText.toLowerCase().includes("magic ball")){
			engaged = true;
			sendTextMessage(senderID, "Yes?");
		} else if (engaged && messageText.toLowerCase().includes("?")) {
			engaged = false;
			sendAnswer(senderID);
		} else if (engaged){
			sendTextMessage(senderID, "Could you repeat your question again?");
		}
	} else if (messageAttachments) {
			sendTextMessage(senderID, "Message with attachment received");
	}
}

/** Firebase **/
var firebase = require("firebase");
// Set the configuration for your app
var firebaseConfig = {
	apiKey: "FIREBASE_API_KEY",
	authDomain: "<APP_CODE>.firebaseapp.com",
	databaseURL: "https://<APP_CODE>.firebaseio.com",	// This chatbot only utilizes Firebase RTDB
	storageBucket: "<APP_CODE>.appspot.com"
};
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();
function sendAnswer(senderID){
	let listAnswers = [];
	database.ref('xball/answers').once('value').then(function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var answer = {};	// initialize new object
			// key
			answer['answerType'] = childSnapshot.key;
			// childData
			answer['answerText'] = childSnapshot.val();
			listAnswers.push(answer);
			console.log("sendAnswer " + answer.answerType + " " + answer.answerText);
		});
		let min = Math.ceil(0), max = Math.floor(Object.keys(listAnswers).length);
		// Generate random num
		let randNum = Math.floor(Math.random() * (max - min + 1)) + min;
		console.log("sendAnswer [" + randNum + "] ");
	    sendTextMessage(senderID, listAnswers[randNum].answerText);
	});
}

function logAnswers(listAnswers){
	console.log("logAnswers listAnswers length " + Object.keys(listAnswers).length);
	for(let index = 0; index < Object.keys(listAnswers).length; index++){
		console.log("logAnswers " + listAnswers[index].answerType + " " + listAnswers[index].answerText);
	}
}
