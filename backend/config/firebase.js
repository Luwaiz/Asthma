const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Prefer environment variables (for Render / cloud deployments)
if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: 'https://accounts.google.com/o/oauth2/auth',
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
                universe_domain: 'googleapis.com',
            })
        });
        console.log('Firebase Admin initialized from environment variables.');
    }
} else {
    // Fallback: try local serviceAccountKey.json (for local development)
    const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        if (!admin.apps.length) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized from serviceAccountKey.json.');
        }
    } else {
        console.warn('WARNING: Firebase Admin could not be initialized. Neither env vars nor serviceAccountKey.json found.');
    }
}

module.exports = admin;
