import 'firebase';
import * as admin from 'firebase-admin';
import serviceAccount from '../config/service-account';

var firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test.firebaseio.com'
});


export const firelord = {
  db: firebase.database(),
  ref: firebase.database().ref(),
  auth: firebase.auth()
}