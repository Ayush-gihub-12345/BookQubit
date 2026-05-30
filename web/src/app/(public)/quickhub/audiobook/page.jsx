"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useRTL } from "@/contexts/RTLContext";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaBook,
  FaUser,
  FaClock,
  FaCalendar,
  FaStar,
  FaDownload,
  FaHeart,
  FaShare,
  FaList,
  FaRandom,
  FaRedoAlt, // Changed from FaRepeat to FaRedoAlt
  FaHeadphones,
  FaMicrophone,
  FaPodcast,
} from "react-icons/fa";
import "./audiobook.css";

const AudiobookPage = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const { direction, textAlign } = useRTL();

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const audioRef = useRef(null);

  // Mock audiobook data
  const audiobook = {
    id: 1,
    title: "Nexus",
    author: "Yuval Noah Harari",
    narrator: "Derek Perkins",
    coverImage: "/images/audiobook-cover.jpg",
    rating: 4.7,
    reviews: 1245,
    duration: "8h 32min",
    published: "2024",
    language: "English",
    description: "A groundbreaking exploration of human history and future, revealing the hidden connections that shaped our world and the forces that will determine our destiny.",
    chapters: [
      { id: 1, title: "Introduction", duration: "12:30" },
      { id: 2, title: "The Cognitive Revolution", duration: "25:45" },
      { id: 3, title: "The Agricultural Revolution", duration: "32:15" },
      { id: 4, title: "The Unification of Humankind", duration: "28:30" },
      { id: 5, title: "The Scientific Revolution", duration: "35:20" },
      { id: 6, title: "The Industrial Revolution", duration: "22:10" },
      { id: 7, title: "The Future of Humanity", duration: "30:45" },
      { id: 8, title: "Conclusion", duration: "15:30" },
    ],
    similarBooks: [
      { id: 1, title: "Sapiens", author: "Yuval Noah Harari", duration: "10h 15m" },
      { id: 2, title: "Homo Deus", author: "Yuval Noah Harari", duration: "9h 45m" },
      { id: 3, title: "21 Lessons for 21st Century", author: "Yuval Noah Harari", duration: "8h 20m" },
    ],
  };

  useEffect(() => {
    setCurrentBook(audiobook);
  }, []);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else if (currentChapter < audiobook.chapters.length - 1) {
        setCurrentChapter(currentChapter + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentChapter, isRepeating, audiobook.chapters.length]);

  // Update audio source when chapter changes
  useEffect(() => {
    if (audioRef.current && currentBook) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentChapter, currentBook, isPlaying]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle playback speed
  const changePlaybackSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle previous chapter
  const previousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  // Handle next chapter
  const nextChapter = () => {
    if (currentChapter < audiobook.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  // Handle chapter selection
  const selectChapter = (index) => {
    setCurrentChapter(index);
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`star ${i <= fullStars ? "filled" : "empty"}`}
          size={14}
        />
      );
    }
    return stars;
  };

  return (
    <div 
      className={`audiobook-page ${isDarkMode ? "dark" : "light"}`}
      dir={direction}
      style={{ fontFamily: currentFont?.family }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      <div className="audiobook-container">
        {/* Header */}
        <div className="audiobook-header">
          <h1 className="audiobook-title">Audiobook Player</h1>
          <p className="audiobook-subtitle">Listen to your favorite books</p>
        </div>

        <div className="audiobook-grid">
          {/* Left Column - Book Info */}
          <div className="audiobook-info">
            <div className="book-cover">
              <div className="cover-placeholder">
                <FaHeadphones size={48} />
              </div>
            </div>
            
            <h2 className="book-title">{currentBook?.title}</h2>
            <p className="book-author">
              <FaUser /> {currentBook?.author}
            </p>
            <p className="book-narrator">
              <FaMicrophone /> Narrated by: {currentBook?.narrator}
            </p>
            
            <div className="book-rating">
              {renderStars(currentBook?.rating || 0)}
              <span className="rating-value">({currentBook?.reviews} reviews)</span>
            </div>
            
            <div className="book-meta">
              <span><FaClock /> {currentBook?.duration}</span>
              <span><FaCalendar /> {currentBook?.published}</span>
              <span>📖 {currentBook?.language}</span>
            </div>
            
            <p className={`book-description ${textAlign}`}>
              {currentBook?.description}
            </p>
            
            <div className="action-buttons">
              <button 
                className={`action-btn like ${isLiked ? "active" : ""}`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <FaHeart /> Like
              </button>
              <button className="action-btn share">
                <FaShare /> Share
              </button>
              <button className="action-btn download">
                <FaDownload /> Download
              </button>
            </div>
          </div>

          {/* Right Column - Player */}
          <div className="audiobook-player">
            <div className="player-card">
              <div className="player-header">
                <h3>Now Playing</h3>
                <div className="player-controls-top">
                  <button 
                    className={`control-btn ${isShuffling ? "active" : ""}`}
                    onClick={() => setIsShuffling(!isShuffling)}
                  >
                    <FaRandom />
                  </button>
                  <button 
                    className={`control-btn ${isRepeating ? "active" : ""}`}
                    onClick={() => setIsRepeating(!isRepeating)}
                  >
                    <FaRedoAlt /> {/* Fixed: Changed from FaRepeat to FaRedoAlt */}
                  </button>
                </div>
              </div>

              <div className="current-book-info">
                <h4 className="current-book-title">{currentBook?.title}</h4>
                <p className="current-book-author">{currentBook?.author}</p>
                <p className="current-chapter">
                  Chapter {currentChapter + 1}: {audiobook.chapters[currentChapter]?.title}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-bar">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="seek-slider"
                  />
                </div>
                <div className="time-info">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="playback-controls">
                <button className="control-btn" onClick={previousChapter}>
                  <FaBackward />
                </button>
                <button className="play-btn" onClick={togglePlayPause}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button className="control-btn" onClick={nextChapter}>
                  <FaForward />
                </button>
              </div>

              {/* Volume Control */}
              <div className="volume-control">
                <button className="volume-icon" onClick={toggleMute}>
                  {isMuted || volume === 0 ? (
                    <FaVolumeMute />
                  ) : volume < 0.5 ? (
                    <FaVolumeDown />
                  ) : (
                    <FaVolumeUp />
                  )}
                </button>
                <div className="volume-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
                <button className="speed-btn" onClick={changePlaybackSpeed}>
                  {playbackSpeed}x
                </button>
              </div>

              {/* Chapters List */}
              <div className="chapters-list">
                <h4>Chapters</h4>
                <div className="chapters-container">
                  {audiobook.chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      className={`chapter-item ${currentChapter === index ? "active" : ""}`}
                      onClick={() => selectChapter(index)}
                    >
                      <span className="chapter-number">{index + 1}.</span>
                      <span className="chapter-title">{chapter.title}</span>
                      <span className="chapter-duration">{chapter.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Audiobooks Section */}
        <div className="similar-audiobooks">
          <h3>Similar Audiobooks You Might Like</h3>
          <div className="similar-grid">
            {audiobook.similarBooks.map((book) => (
              <div key={book.id} className="similar-card">
                <div className="similar-cover">
                  <FaHeadphones size={24} />
                </div>
                <div className="similar-info">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                  <span>{book.duration}</span>
                </div>
                <button className="listen-btn">Listen</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudiobookPage;