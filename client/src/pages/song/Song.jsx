import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import Mp3Card from '../../components/Mp3Card';
import Navbar from '../../components/Navbar';

const Song = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { songName } = useParams();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        console.log('Fetching song:', songName);
        setIsLoading(true);
        setError(null);

        const response = await fetch('/download-song', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songName }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        let chunks = [];
        let totalLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalLength += value.length;
          console.log('Received chunk, size:', value.length, 'Total size:', totalLength);
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        console.log('Created blob, size:', blob.size);

        const url = URL.createObjectURL(blob);
        console.log('Created audio URL:', url);
        setAudioUrl(url);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching song:', error);
        setError('Failed to fetch song');
        setIsLoading(false);
      }
    };

    fetchSong();
    fetchThumbnail();
  }, [songName]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      console.log('Set audio source:', audioRef.current.src);
    }
  }, [audioUrl]);

  const fetchThumbnail = async () => {
    try {
      console.log('Fetching thumbnail for:', songName);
      const response = await fetch('/get-song-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songName }),
      });
      const data = await response.json();
      console.log('Thumbnail data:', data);
      setThumbnailUrl(data.songInfo.thumbnailUrl);
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
    }
  };

  const handleCanPlay = () => {
    console.log('Audio can play');
    if (audioRef.current) {
      console.log('Audio duration:', audioRef.current.duration);
      console.log('Audio ready state:', audioRef.current.readyState);
    }
  };

  const handleError = (e) => {
    console.error('Audio error:', e);
    setError(`Audio error: ${e.target.error ? e.target.error.message : 'Unknown error'}`);
  };

  return (
    <>
      <Navbar />
      <div>
        <h2>Now Playing: {songName}</h2>
        {isLoading ? (
          <p id='loading'>Loading...</p>
        ) :
          <>
            <Mp3Card music_cover={thumbnailUrl} album_name={songName} sing_by="Artist" music_src={audioUrl} />
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </>
        }
      </div>
    </>
  )
}

export default Song