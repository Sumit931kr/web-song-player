import { useState } from 'react'
import './App.css'
import Cover from './assets/music_cover.jpg';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ImportPlaylist from './components/ImportPlaylist';
import Song from './pages/song/Song';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/import-playlist" element={<ImportPlaylist/>}/>
          <Route path="/song/:songName" element={<Song/>}/>
        </Routes>
      </Router>
  )
}

export default App
