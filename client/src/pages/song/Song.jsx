import React,{useState,useEffect} from 'react'
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Mp3Card from '../../components/Mp3Card';
import Cover from '../../../public/music_cover.jpg'



const Song = () => {
  const [audioSrc, setAudioSrc] = useState('');
  const { songName } = useParams();
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch('http://localhost:3000/download-song', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ songName }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch song');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    };

    fetchSong();
    fetchThumbnail(songName);
  }, [songName]);

  const fetchThumbnail = async (songName) => {
    try {
      const response = await fetch('http://localhost:3000/get-song-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songName }),
      });   
      const data = await response.json();
      setThumbnailUrl(data.songInfo.thumbnailUrl);
    } catch (error) {
      console.error('Error fetching thumbnail:', error);
      return null;
    }
  };    

  return (
    <>
    <Navbar/>
    <div>
      <h2>Now Playing: {songName}</h2>
      {audioSrc ? <Mp3Card music_cover={thumbnailUrl}  album_name={songName} sing_by="Kanye" music_src={audioSrc}/> : <p>Loading...</p>}
      {/* <Mp3Card music_src={audioSrc}/> */}
      {/* {audioSrc && (
          <audio controls>
          <source src={audioSrc} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )} */}
    </div>
      </>
  )
}

export default Song