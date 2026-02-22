const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully.');
} else {
    console.warn('WARNING: serviceAccountKey.json not found. Firebase Admin not initialized.');
    console.warn('Please place serviceAccountKey.json in the backend directory.');
}

module.exports = admin;
