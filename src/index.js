'use strict'

import './server';
import './services/firebase';
import { FB_PAGE_ACCESS_TOKEN, sendTextMessage } from './services/facebook';
import { firelord } from './services/firebase';

async function sendAnswer(senderID) {

  let listAnswers = [];

  const snap = await firelord.REF
    .child('xball')
    .child('answers')
    .once('value');
  
  snap.forEach(snapChild => {
    var answer = {};	// initialize new object
    // key
    answer['answerType'] = snapChild.key;
    // childData
    answer['answerText'] = snapChild.val();
    listAnswers.push(answer);
    console.log("sendAnswer " + answer.answerType + " " + answer.answerText);
  });

  let min = Math.ceil(0), max = Math.floor(Object.keys(listAnswers).length);

  // Generate random num
  let randNum = Math.floor(Math.random() * (max - min + 1)) + min;

  console.log("sendAnswer [" + randNum + "] ");
  sendTextMessage(senderID, listAnswers[randNum].answerText);
}