const { default: axios } = require('axios');
const express = require('express');
const { readFileSync } = require('fs');
  
const app = express();
const PORT = 3000;
  
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Running on http://www.localhost:" + PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get('/', (req, res) => {
  res.send(template(`<a href="${getTwitterOauthUrl()}">Authorize with Twitter</a>`));
});

app.get('/refresh_token', async (req, res) => {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const body = {
    grant_type: 'authorization_code',
    code: req.query.code,
    redirect_uri: 'http://www.localhost:3000/refresh_token',
    client_id: clientId,
    code_verifier: 'challenge'
  };
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  
  const auth = {
    username: clientId,
    password: process.env.TWITTER_CLIENT_SECRET
  }

  console.log('requesting token', body, headers);
  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', body, { headers, auth });
    const { access_token, refresh_token } = response.data;
    console.log(response.data);
    res.send(template(`access_token: <code>${access_token}</code><br>refresh_token: <code>${refresh_token}</code>`));
  }
  catch (error) {
    console.log('Error getting token', error.response.data);
    return res.send(template(JSON.stringify(error.response.data)));
  }
  
});



function template(content){
  const t = readFileSync('./templates/template.html', 'utf8');
  return t.replace('#content#', content);
}

function getTwitterOauthUrl() {
  const rootUrl = "https://twitter.com/i/oauth2/authorize";
  const options = {
    redirect_uri: 'http://www.localhost:3000/refresh_token',
    client_id: process.env.TWITTER_CLIENT_ID,
    state: "state",
    response_type: "code",
    code_challenge: "challenge",
    code_challenge_method: "plain",
    scope: ["users.read", "tweet.read", "tweet.write", "follows.read", "follows.write", "offline.access"].join(" "),
  };
  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}