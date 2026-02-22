const dotenv = require('dotenv');
dotenv.config();

const aiService = require('./services/aiService');
const mongoose = require('mongoose');

const testAI = async () => {
    console.log('Testing AI Service...');

    // Mock user logs
    const logs = [
        {
            date: new Date(),
            symptoms: ['Coughing', 'Wheezing'],
            severity: 'Moderate',
            triggers: ['Dust'],
            notes: 'Felt tight chest manually'
        },
        {
            date: new Date(Date.now() - 86400000),
            symptoms: ['Shortness of breath'],
            severity: 'Mild',
            triggers: [],
            notes: 'Okay day'
        }
    ];

    // Mock user context
    const userContext = {
        age: 30,
        gender: 'Male',
        asthmaLevel: 'Moderate',
        triggers: ['Dust', 'Pollen']
    };

    try {
        console.log('Calling getHealthStatus...');
        const status = await aiService.getHealthStatus(logs, userContext);

        const fs = require('fs');
        fs.writeFileSync('result.json', JSON.stringify(status, null, 2));

        console.log('Health Status Result:', JSON.stringify(status, null, 2));

        console.log('\nCalling getInsights...');
        const insights = await aiService.getInsights(logs, userContext);
        console.log('Insights Result:', JSON.stringify(insights, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
        const fs = require('fs');
        fs.writeFileSync('test_error.log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
};

testAI();
