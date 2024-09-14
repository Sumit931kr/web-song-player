import React, { useState, useRef } from "react";
import demo_video from "../assets/demo_video.mp4";
import { FaRegCirclePlay } from "react-icons/fa6";
import { IoPauseCircleOutline } from "react-icons/io5";
import Navbar from "./Navbar";
const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);

      setShowControls(true);
      setTimeout(() => {
        setShowControls(false);
      }, 1500);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="pt-32 items-center rounded-lg px-12">
      <div className="flex justify-between items-center">
        <div className="w-1/2 pr-4 ">
          <p className="text-[60px] font-poppins mb-2">
            <span style={{ color: "#c5af76" }}>
              Stream your Favorite tracks
            </span>{" "}
            from <span style={{ color: "#c57699" }}>Spotify playlists</span> and
            enjoy a playlist made just for you.
          </p>
        </div>

        <div className="w-1/2 relative hover:shadow-lg hover:shadow-black transition-shadow duration-300">
          <video
            ref={videoRef}
            onClick={handlePlayPause}
            className="w-full rounded-lg"
          >
            <source src={demo_video} type="video/mp4" />
          </video>

          {showControls && (
            <button
              onClick={handlePlayPause}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              {isPlaying ? (
                <IoPauseCircleOutline size={40} />
              ) : (
                <FaRegCirclePlay size={40} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
