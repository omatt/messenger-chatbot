
---

**NOTE:**

This sample project uses Heroku's free-tier to host the chat bot. [Heroku's pricing change](https://blog.heroku.com/next-chapter) will be removing their free-tier and there are no plans to move this sample chat bot project to a paid-tier. While this project can still be used, the project will **no longer be actively maintained**.

---

# messenger-chatbot
A simple Facebook Messenger chat bot using Heroku + Firebase

![](https://github.com/omatt/messenger-chatbot/blob/master/res/heroku_firebase.png "Heroku + Firebase")

Q: Why not just use one or the other?

A: Hosting Messenger chatbot using Firebase Functions would require external invocations - which is currently only available on [Paid Plan](https://firebase.google.com/pricing/). See Functions > Outbound Networking. Also, I want to demonstrate Firebase Realtime Database using javascript.

Try [Magic X Ball](https://m.me/magicxball) Messenger Bot now.

![](https://github.com/omatt/messenger-chatbot/blob/master/res/sample_chat.PNG "is the weather good today?")

## Setup
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli). Create an account on [Heroku](https://www.heroku.com/) if you don't have one.
2. Install [nodejs](https://nodejs.org/en/download/). Open your terminal and make sure that you have the updated version. If you're having issues with your npm version, you may use nvm and follow this guide [here](https://github.com/creationix/nvm)

    ```
    sudo npm install -g npm 
    npm -v       // Check npm version
    ```
3. Create a folder for your project and create a initialize a new Node project.

    ```
    npm init
    ```
4. Install additional Node dependencies. Express is for the server, request is for sending out messages, and body-parser is to process messages.

    ```
    npm install express request body-parser --save
    ```
5. Follow steps on [Facebook docs](https://developers.facebook.com/docs/messenger-platform/guides/quick-start) for the setup of your Messenger chatbot and getting the required API Keys. 

6. You may use the index.js on this project as a base and fill the required API Keys for your app to work.

    ``` javascript
    const token = "FB_PAGE_ACCESS_TOKEN"
    ```
    Get the Page Access Token by following the Step 3 of the [docs](https://developers.facebook.com/docs/messenger-platform/guides/quick-start).

7. This app mimics a Magic 8 Ball. The bot will only accept answers when called as 'magic ball' or 'magicball'. An answer will be detected if the message from the user has a '?' at the end of the sentence.

    ``` javascript
    var engaged = false;  // set as false by default
    if (messageText) {
      // If we receive a text message, check to see if it matches a keyword
      // and send back an answer. Otherwise, ask the question again.
      if (messageText.toLowerCase().replace(/\s+/g, '')includes("magicball")){
        engaged = true; // Start accepting questions
        sendTextMessage(senderID, "Yes?");
      } else if (engaged && messageText.toLowerCase().includes("?")) {
        engaged = false;  // Once question is answered - set to false again
        sendAnswer(senderID);
      } else if (engaged){
        sendTextMessage(senderID, "Could you repeat your question again?");
      }
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Message with attachment received");
    }
    ```

8. For Firebase, currently, we'll only be using Realtime Database to fetch data. Create an account on [Firebase](https://firebase.google.com/) if you don't have one.

9. For Realtime Datbase, you may follow the quickstart guide [here](https://firebase.google.com/docs/database/web/start). You can find your Realtime Database URL in the Database tab in the [Firebase console](https://console.firebase.google.com). It will be in the form of https://<databaseName>.firebaseio.com.

    ``` javascript
    /** Firebase **/
    var firebase = require("firebase");
    // Set the configuration for your app
    var firebaseConfig = {
      apiKey: "FIREBASE_API_KEY",  // Firebase Console > Project > Settings > Web API Key
      authDomain: "<APP_CODE>.firebaseapp.com",
      databaseURL: "https://<APP_CODE>.firebaseio.com",	// This chatbot only utilizes Firebase RTDB
      storageBucket: "<APP_CODE>.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);
    // Get a reference to the database service
    var database = firebase.database();
    ```
    
10. Reading from Firebase Realtime Database. You may read the docs [here](https://firebase.google.com/docs/database/web/read-and-write#read_data_once).

    ``` javascript
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
    ```
    The data is based from the list of possible answers of a [Magic 8 Ball](https://en.wikipedia.org/wiki/Magic_8-Ball)
    
    ![](https://github.com/omatt/messenger-chatbot/blob/master/res/sample_db.png "Magic 8 Ball Answers")
    
11. Create a file named Procfile and copy the line below. This is so Heroku can know what file to run.

    ```
    web: node index.js
    ```
    
12. Commit all the code with Git then create a new Heroku instance and push the code to the cloud.
    
    ```
    git init
    git add .
    git commit --message "Initial commit"
    heroku create  // This will create a new project on Heroku, do this if you don't have a project for your chatbot yet.
    git push heroku master
    ```

13. Test your bot

14. Make your bot public! Try this bot now - [Magic X Ball](https://m.me/magicxball)
    * You may share your bot by sharing its link https://m.me/<PAGE_USERNAME>
    * If you haven't published your bot yet, it can only respond to registered Developers/Testers on your [Facebook App](https://developers.facebook.com/apps/APP_ID/roles/)
    * Publish your Facebook App (Messenger Bot) by following their guide [here](https://developers.facebook.com/docs/messenger-platform/product-overview/launch).

## Sources
This won't be possible without the sources from:
* Facebook Messenger Platform guide [link](https://developers.facebook.com/docs/messenger-platform/guides/quick-start)
* Firebase docs [link](https://firebase.google.com/docs/database/web/start)
* jw84/messenger-bot-tutorial [link](https://github.com/jw84/messenger-bot-tutorial)

