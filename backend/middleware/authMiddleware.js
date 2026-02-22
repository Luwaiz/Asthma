const admin = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        console.log('Verifying token from header...');
        // If Firebase Admin isn't initialized, we can't verify the token
        if (!admin.apps.length) {
            return res.status(500).json({ error: 'Firebase Admin not initialized' });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Token verified for user:', decodedToken.email);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(401).json({ error: 'Unauthorized: Invalid token', details: error.message });
    }
};

module.exports = authMiddleware;
