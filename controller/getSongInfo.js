

const getSongInfo = async (req, res, spotifyApi) => {
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
}

module.exports = {
    getSongInfo
}