require('dotenv').config();
const express = require('express');
const request = require('request-promise');
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
  const authURL = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=profile`;
  res.send(`<a href="${authURL}">Login with OAuth2</a>`);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await request.post({
      url: TOKEN_URL,
      json: true,
      form: {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      },
      resolveWithFullResponse: true
    });

    console.log('Token response:', tokenResponse);

    const { access_token } = tokenResponse.body;

    const userInfo = await request.get({
      url: USERINFO_URL,
      json: true,
      headers: {
        'Authorization': `Bearer ${access_token}`
      },
      resolveWithFullResponse: true
    });

    console.log('User info response:', userInfo);

    res.send(`<h1>Welcome ${userInfo.body.name}!</h1>`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error during OAuth2 flow: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
