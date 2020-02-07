import request from 'request';
export const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
var engaged = false;

export const sendTextMessage = (sender, text) => {
  let messageData = { text: text }
  let options = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: FB_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }
  
  request(options, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}


export const receivedMessage = (event) => {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log('Received message for user %d and page %d at %d with message:',
  senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back an answer. Otherwise, ask the question again.
    if (messageText.toLowerCase().replace(/\s+/g, '').includes('magicball')){
      engaged = true; // Start accepting questions
      sendTextMessage(senderID, 'Yes?');
    } else if (engaged && messageText.toLowerCase().includes('?')) {
      engaged = false;  // Once question is answered - set to false again
      sendAnswer(senderID);
    } else if (engaged) {
      sendTextMessage(senderID, 'Could you repeat your question again?');
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, 'Message with attachment received');
  }
}