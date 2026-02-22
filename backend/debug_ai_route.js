const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserProfile = require('./models/UserProfile');
const DailyLog = require('./models/DailyLog');
const aiService = require('./services/aiService');

const debugRoute = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Find a user to test with, or use a specific ID if known
        // I'll try to find the most recent user
        const user = await UserProfile.findOne({});
        if (!user) {
            console.log('No users found in DB to test with.');
            return;
        }

        const userId = user.userId;
        console.log(`Testing with userId: ${userId}`);

        // Replicate route logic
        console.log('Fetching logs...');
        const logs = await DailyLog.find({ userId }).sort({ date: -1 }).limit(7);
        console.log(`Found ${logs.length} logs.`);

        console.log('Fetching profile again for context...');
        const profile = await UserProfile.findOne({ userId });
        console.log('Profile found:', profile ? 'Yes' : 'No');

        let age = 'Unknown';
        if (profile && profile.yearOfBirth) {
            age = new Date().getFullYear() - profile.yearOfBirth;
        }
        console.log(`Calculated Age: ${age}`);

        const userContext = {
            age,
            gender: profile?.gender || 'Unknown',
            asthmaLevel: profile?.asthmaLevel || 'Unknown',
            triggers: profile?.triggers || []
        };
        console.log('User Context:', userContext);

        console.log('Calling aiService.getHealthStatus...');
        const status = await aiService.getHealthStatus(logs, userContext);
        console.log('Status Result:', JSON.stringify(status, null, 2));

    } catch (error) {
        console.error('DEBUG FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debugRoute();
