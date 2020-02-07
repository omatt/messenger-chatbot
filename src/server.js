'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
const app = express();

app.set('port', (process.env.PORT || 5003))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', (req, res) => {
  res.send('Hello world, I am a chat bot');
})

// for Facebook verification
app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'test_hook') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'))
})

app.post('/webhook', (req, res) => {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(entry => {
      // var pageID = entry.id;
      // var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(event => {
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