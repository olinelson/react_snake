import * as firebase from 'firebase'
import firestore from 'firebase/firestore'

const settings = { timestampsInSnapshots: true }

const config = {
  apiKey: 'AIzaSyCC2KO8EFDPYz46572Cn8R9bqAzCCWusss',
  authDomain: 'reactsnake-bc40e.firebaseapp.com',
  databaseURL: 'https://reactsnake-bc40e.firebaseio.com',
  projectId: 'reactsnake-bc40e',
  storageBucket: 'reactsnake-bc40e.appspot.com',
  messagingSenderId: '17681991551',
  appId: '1:17681991551:web:dcfb0aed45141dc8ff3c4a',
  measurementId: 'G-YW37NQR6X2'
}
firebase.initializeApp(config)

firebase.firestore().settings(settings)

export default firebase
