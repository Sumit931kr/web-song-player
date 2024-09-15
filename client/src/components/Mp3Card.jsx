import React, { useState } from "react";

const Mp3Card = (props) => {

    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true)
    }

    const handlePause = () => {
        setIsPlaying(false)
    }

  return (
    <div className={`flex justify-center items-center py-4 transition-all duration-500 ${
        isPlaying ? "bg-blue-900" : "bg-[#24233b]"
      }`}>
      <div className="flex flex-col justify-center items-center text-center w-[300px] h-[400px] mx-auto bg-[#24233b] rounded-lg z-10 shadow-[0px_10px_10px_black]">
        <h1 className="pb-4 text-xl">{props.album_name}</h1>

        <img
          className="w-[180px] h-[180px] rounded-[3%] transition-transform duration-500 ease-in-out"
          src={props.music_cover}
          alt="album cover"
        />

        <h1 className="pt-4 pb-4">{props.Sing_by}</h1>
        <audio
          controls
          className="w-[250px] bg-transparent"
          style={{ accentColor: "#1db954" }}
          onPlay={handlePlay}
          onPause={handlePause}
          type="audio/mpeg"
        >
          <source src={props.music_src} type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
};

export default Mp3Card;
