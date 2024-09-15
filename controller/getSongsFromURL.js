

const getSongsFromURL = async (req, res, spotifyApi) => {
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
}

module.exports = {
    getSongsFromURL
}
