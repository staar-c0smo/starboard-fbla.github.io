const functions = require('firebase-functions');
const axios = require('axios');

exports.verifyRecaptcha = functions.https.onCall(async (data, context) => {
  const recaptchaToken = data.token;
  
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${functions.config().recaptcha.secret_key}&response=${recaptchaToken}`
    );
    
    return {
      success: response.data.success,
      score: response.data.score
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    throw new functions.https.HttpsError('internal', 'reCAPTCHA verification failed');
  }
});