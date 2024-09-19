
const { getSongInfo } = require('./controller/getSongInfo');
const { getSongsFromURL } = require('./controller/getSongsFromURL');
const { downloadSong } = require('./controller/downloadSong');

const express = require('express'); 
const cors = require("cors")

const app = express();
app.use(express.json());
app.use(cors())
const dotenv =  require('dotenv');
dotenv.config();

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Authenticate with Spotify and start the server only after successful authentication
spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    // console.log('The access token is ' + data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);

    // Start the server after successful authentication
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  },
  function (err) {
    console.log('Authentication Error Details:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
);

const path = require('path');

// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});





app.post('/spotify-url', (req, res)=>{
  getSongsFromURL(req, res, spotifyApi)
});

app.post('/get-song-info', (req,res)=>{
  getSongInfo(req, res, spotifyApi)
});


app.post('/download-song', (req,res)=>{
  downloadSong(req, res)
});

