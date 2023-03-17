require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const port = 3000;

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  AUTHORIZATION_URL,
  TOKEN_URL,
  USERINFO_URL
} = process.env;

app.get('/', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const authURL = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile&state=${state}`;
  res.send(`<a href="${authURL}">Login with OAuth2</a>`);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    const tokenResponse = await axios.post(TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Token response:', tokenResponse);

    const { access_token } = tokenResponse.data;

    const userInfo = await axios.get(USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('User info response:', userInfo);

    res.send(`<h1>Welcome ${userInfo.data.name}!</h1>`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error during OAuth2 flow: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
