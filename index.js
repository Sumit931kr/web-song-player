const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

// const io = require("socket.io")
const cors = require("cors")

const app = express();
app.use(express.json());
app.use(cors())

const dotenv =  require('dotenv');
dotenv.config();

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Authenticate with Spotify and start the server only after successful authentication
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    // console.log('The access token is ' + data.body['access_token']);
    spotifyApi.setAccessToken(data.body['access_token']);
    
    // Start the server after successful authentication
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  },
  function(err) {
    console.log('Authentication Error Details:', JSON.stringify(err, null, 2));
    process.exit(1);
  }
);

app.post('/spotify-url', async (req, res) => {
  try {
    const { url } = req.body;
    const playlistId = url.split('/').pop().split('?')[0];

    const data = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = data.body.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(', '),
      album: item.track.album.name
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching playlist tracks' });
  }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


app.post('/get-song-info', async (req, res) => {
  try {
    const { songName } = req.body;
    console.log(songName)

    // Search for the track
    const searchResult = await spotifyApi.searchTracks(songName, { limit: 1 });
    
    if (searchResult.body.tracks.items.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const track = searchResult.body.tracks.items[0];

    // Extract relevant information including the thumbnail URL
    const songInfo = {
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      previewUrl: track.preview_url,
      thumbnailUrl: track.album.images[0]?.url || null // Get the first (usually largest) image URL
    };

    res.json({
      message: 'Song information retrieved',
      songInfo
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});


app.post('/download-song1', async (req, res) => {
  try {
    const { songName } = req.body;

    // Search for the track
    const searchResult = await spotifyApi.searchTracks(songName, { limit: 1 });
    
    if (searchResult.body.tracks.items.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const track = searchResult.body.tracks.items[0];

    // Note: Spotify API doesn't provide direct download links for songs due to copyright restrictions
    // Instead, we'll return the track information and preview URL if available

    const songInfo = {
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      previewUrl: track.preview_url
    };

    res.json({
      message: 'Song information retrieved',
      songInfo,
      note: 'Due to copyright restrictions, full song download is not available. A 30-second preview URL is provided if available.'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

app.post('/download-song', async (req, res) => {
  try {
    const { songName } = req.body;
    console.log(songName)
    
    // Define the download directory
    const downloadDir = path.join(__dirname, 'downloads');
    
    // Create the download directory if it doesn't exist
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    
    // Execute spotdl command
    exec(`spotdl "${songName}" --output "${downloadDir}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'An error occurred while downloading the song' });
      }

      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      // Find the downloaded file
      fs.readdir(downloadDir, (err, files) => {
        if (err) {
          console.error(`Error reading directory: ${err}`);
          return res.status(500).json({ error: 'An error occurred while locating the downloaded song' });
        }

        const downloadedFile = files.find(file => file.includes(songName));

        if (downloadedFile) {
          const filePath = path.join(downloadDir, downloadedFile);
          res.download(filePath, (err) => {
            if (err) {
              console.error(`Error sending file: ${err}`);
              return res.status(500).json({ error: 'An error occurred while sending the file' });
            }
            // Delete the file after sending
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) console.error(`Error deleting file: ${unlinkErr}`);
            });
          });
        } else {
          res.status(404).json({ error: 'Downloaded file not found' });
        }
      });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});



exec('cd client && npm run host', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

