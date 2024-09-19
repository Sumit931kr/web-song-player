const getSongInfo = async (req, res, spotifyApi) => {
    try {
        const { songUrl } = req.body;
        console.log('Fetching info for:', songUrl);

        // Extract track ID from the Spotify URL
        const trackId = songUrl.split('/').pop().split('?')[0];

        // Get track details using the ID
        const trackResult = await spotifyApi.getTrack(trackId);
        
        if (!trackResult.body) {
            return res.status(404).json({ error: 'Song not found' });
        }

        const track = trackResult.body;

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
};

module.exports = {
    getSongInfo
};
