const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Retry helper function with exponential backoff for handling temporary API overload
 * @param {Function} fn - The async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds (will be multiplied for exponential backoff)
 * @returns {Promise} - Result of the function or throws error after all retries exhausted
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries - 1;
            const is503Error = error.status === 503;

            if (is503Error && !isLastAttempt) {
                const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
                console.log(`API temporarily overloaded (503). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // Re-throw error if not 503, or if we've exhausted all retries
            throw error;
        }
    }
};

/**
 * Fallback to OpenAI GPT when Gemini is unavailable
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Promise<object>} - Parsed JSON response
 */
const getOpenAIFallback = async (prompt) => {
    if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured. Skipping fallback.');
        throw new Error('No fallback API key');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant for an asthma tracking application. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content.trim();

        // Clean up JSON response if it contains markdown formatting
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('OpenAI Fallback Error:', error);
        throw error;
    }
};

/**
 * Generate a basic fallback response when all AI services fail
 * @param {string} type - 'insights' or 'healthStatus'
 * @returns {object} - Basic response object
 */
const getBasicFallback = (type, reason = null) => {
    const isRateLimit = reason === 'rate_limit';

    if (type === 'insights') {
        return {
            status: isRateLimit ? "AI Busy" : "Data Logged",
            trend: isRateLimit
                ? "The AI service is currently experiencing high traffic. Please try refreshing in a minute."
                : "Your symptoms have been recorded. Continue tracking to see trends over time.",
            color: isRateLimit ? "#f59e0b" : "#087179" // Orange for busy, Teal for success
        };
    } else {
        return {
            label: isRateLimit ? "AI Busy" : "Daily Tip",
            description: isRateLimit
                ? "AI service is temporarily busy. Try again shortly."
                : "Log symptoms daily for personalized health tips.",
            color: isRateLimit ? "#f59e0b" : "#087179"
        };
    }
};

const getInsights = async (logs, userContext = {}) => {
    if (!logs || logs.length === 0) return null;

    const { age, gender, asthmaLevel, triggers } = userContext;

    const prompt = `
    You are an AI assistant for an asthma tracking app. 
    
    User Context:
    - Age: ${age}
    - Gender: ${gender}
    - Asthma Severity: ${asthmaLevel}
    - Known Triggers: ${Array.isArray(triggers) ? triggers.join(', ') : 'None'}

    Analyze the following list of daily logs from this user and provide concise, helpful medical-contextual insights.
    Focus on trends, potential triggers, and if the symptoms seem to be getting better or worse.
    Tailor your advice to the user's age and gender where relevant.
    
    Logs:
    ${JSON.stringify(logs, null, 2)}
    
    Return the response as a JSON object with the following structure:
    {
        "status": "A short status label (e.g., Well Controlled, Action Needed, Moderate Risk)",
        "trend": "A detailed explanation of the trend observed (1-2 sentences)",
        "color": "A hex color code representing the status (Green: #10b981, Orange: #f59e0b, Red: #ef4444)"
    }
    `;

    // Try Gemini first
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        console.log('✅ Gemini AI insights generated successfully');
        return JSON.parse(cleanJson);
    } catch (geminiError) {
        console.warn('⚠️ Gemini failed, attempting OpenAI fallback...', geminiError.message);

        // Try OpenAI fallback
        try {
            const fallbackResult = await getOpenAIFallback(prompt);
            console.log('✅ OpenAI fallback insights generated successfully');
            return fallbackResult;
        } catch (openaiError) {
            console.warn('⚠️ OpenAI fallback also failed. Using basic fallback.', openaiError.message);

            // Check if failure was due to rate limit (429)
            const isRateLimit = geminiError.status === 429 || geminiError.message?.includes('429');

            // Return basic fallback to ensure user experience isn't broken
            return getBasicFallback('insights', isRateLimit ? 'rate_limit' : null);
        }
    }
};

const getHealthStatus = async (logs, userContext = {}) => {
    if (!logs || logs.length === 0) return null;

    const { age, gender, asthmaLevel, triggers } = userContext;

    const prompt = `
    Based on the following asthma daily logs, provide ONE extremely direct, imperative health tip for the user.
    
    User Context:
    - Age: ${age}
    - Gender: ${gender}
    - Asthma Severity: ${asthmaLevel}

    STRICT RULES:
    1. EXTREMELY DIRECT: Use imperative verbs (e.g., 'Do X', 'Avoid Y').
    2. NO EXPLANATIONS: Do not explain why the tip is given.
    3. NO FILLER: No "Since...", "Because...", or "I suggest...".
    
    EXAMPLES:
    - BAD: "Since it's dusty today, you should try to stay indoors."
    - GOOD: "Stay indoors to avoid dust today."
    - BAD: "Drinking water helps, so try to have 2 cups."
    - GOOD: "Drink 2 cups of water today."
    - BAD: "You are wheezing more, see a doctor."
    - GOOD: "See a doctor today."

    Logs:
    ${JSON.stringify(logs, null, 2)}
    
    Return the response as a JSON object with the following structure:
    {
        "label": "A short category (e.g., Tip, Maintenance, Alert)",
        "description": "ONE direct imperative tip. Strictly under 15 words.",
        "color": "Hex code (Green: #10b981, Orange: #f59e0b, Red: #ef4444)"
    }
    `;

    // Try Gemini first
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await retryWithBackoff(async () => {
            return await model.generateContent(prompt);
        });
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        console.log('✅ Gemini health status generated successfully');
        return JSON.parse(cleanJson);
    } catch (geminiError) {
        console.warn('⚠️ Gemini failed, attempting OpenAI fallback...', geminiError.message);

        // Try OpenAI fallback
        try {
            const fallbackResult = await getOpenAIFallback(prompt);
            console.log('✅ OpenAI fallback health status generated successfully');
            return fallbackResult;
        } catch (openaiError) {
            console.warn('⚠️ OpenAI fallback also failed. Using basic fallback.', openaiError.message);

            // Check if failure was due to rate limit (429)
            const isRateLimit = geminiError.status === 429 || geminiError.message?.includes('429');

            // Return basic fallback to ensure user experience isn't broken
            return getBasicFallback('healthStatus', isRateLimit ? 'rate_limit' : null);
        }
    }
};

module.exports = {
    getInsights,
    getHealthStatus
};
