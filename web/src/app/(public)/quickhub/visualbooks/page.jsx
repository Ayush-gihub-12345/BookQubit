"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFont } from "@/contexts/FontContext";
import { useRTL } from "@/contexts/RTLContext";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaClosedCaptioning,
  FaFilm,
  FaBook,
  FaUser,
  FaClock,
  FaStar,
  FaHeart,
  FaShare,
  FaDownload,
  FaList,
  FaPalette,
  FaMagic,
  FaTachometerAlt,
  FaRedoAlt,
  FaRandom,
  FaBackward,
  FaForward,
} from "react-icons/fa";
import "./visualbooks.css";

const VisualBookPage = () => {
  const { theme, themeName } = useTheme();
  const { t } = useLanguage();
  const { currentFont } = useFont();
  const { direction, textAlign } = useRTL();

  const isDarkMode = themeName === "dark" || themeName === "midnight" || themeName === "cyberpunk";

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [visualStyle, setVisualStyle] = useState("illustration");
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isRepeating, setIsRepeating] = useState(false);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Mock visual book data
  const visualBook = {
    id: 1,
    title: "The Visual History of Humanity",
    author: "Yuval Noah Harari",
    narrator: "Derek Perkins",
    artist: "Studio Pixel",
    duration: "2h 45min",
    published: "2024",
    rating: 4.9,
    reviews: 3420,
    description: "An immersive visual journey through human history, combining stunning animations, historical illustrations, and expert narration to bring the story of our species to life.",
    visualStyles: ["illustration", "cinematic", "animated"],
    chapters: [
      { id: 1, title: "The Dawn of Humanity", duration: "15:30", description: "Explore the origins of Homo sapiens" },
      { id: 2, title: "The Cognitive Revolution", duration: "22:45", description: "How language changed everything" },
      { id: 3, title: "The Agricultural Revolution", duration: "28:15", description: "The greatest fraud in history" },
      { id: 4, title: "The Unification of Humankind", duration: "25:30", description: "Empires, money, and religion" },
      { id: 5, title: "The Scientific Revolution", duration: "32:20", description: "Discovery of ignorance" },
      { id: 6, title: "The Industrial Revolution", duration: "20:45", description: "Machines reshape society" },
      { id: 7, title: "The Future of Humanity", duration: "20:50", description: "What lies ahead" },
    ],
    visualHighlights: [
      { time: "05:30", title: "First Cave Paintings", type: "Animation" },
      { time: "12:15", title: "Neanderthal Encounter", type: "3D" },
      { time: "18:45", title: "Language Evolution", type: "Motion Graphics" },
      { time: "25:30", title: "Great Wall of China", type: "Cinematic" },
    ],
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      if (isRepeating) {
        video.currentTime = 0;
        video.play();
      } else if (currentChapter < visualBook.chapters.length - 1) {
        setCurrentChapter(currentChapter + 1);
      } else {
        setIsPlaying(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [currentChapter, isRepeating]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && showControls) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls, currentTime]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowControls(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const selectChapter = (index) => {
    setCurrentChapter(index);
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  };

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
      className={`visualbook ${isDarkMode ? "dark" : "light"}`}
      dir={direction}
      style={{ fontFamily: currentFont?.family }}
    >
      <div className="visualbook-container">
        {/* Header */}
        <div className="visualbook-header">
          <h1 className="visualbook-title">
            <FaFilm className="title-icon" />
            VisualBook
          </h1>
          <p className="visualbook-subtitle">Experience books like never before with stunning visuals</p>
        </div>

        <div className="visualbook-grid">
          {/* Video Player Section */}
          <div className="video-section">
            <div 
              ref={playerContainerRef}
              className={`video-player-container ${isFullscreen ? "fullscreen" : ""}`}
              onMouseMove={() => setShowControls(true)}
            >
              <video
                ref={videoRef}
                className="video-player"
                poster="/poster.jpg"
              >
                <source src="/sample-video.mp4" type="video/mp4" />
                <track kind="captions" srcLang="en" label="English" />
              </video>

              {/* Video Controls Overlay */}
              {showControls && (
                <div className="video-controls-overlay">
                  <div className="video-controls">
                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <input
                          type="range"
                          min="0"
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="seek-slider"
                        />
                        <div 
                          className="progress-fill" 
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <div className="time-info">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="control-buttons">
                      <button className="control-btn" onClick={togglePlayPause}>
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      
                      <div className="volume-control">
                        <button className="control-btn" onClick={toggleMute}>
                          {isMuted || volume === 0 ? <FaVolumeMute /> : volume < 0.5 ? <FaVolumeDown /> : <FaVolumeUp />}
                        </button>
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

                      <button className="control-btn" onClick={changePlaybackSpeed}>
                        {playbackSpeed}x
                      </button>

                      <button 
                        className={`control-btn ${showCaptions ? "active" : ""}`}
                        onClick={() => setShowCaptions(!showCaptions)}
                      >
                        <FaClosedCaptioning />
                      </button>

                      <button className="control-btn" onClick={toggleFullscreen}>
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Style Selector */}
            <div className="visual-style-selector">
              <h4>Visual Style</h4>
              <div className="style-buttons">
                <button 
                  className={`style-btn ${visualStyle === "illustration" ? "active" : ""}`}
                  onClick={() => setVisualStyle("illustration")}
                >
                  <FaPalette /> Illustration
                </button>
                <button 
                  className={`style-btn ${visualStyle === "cinematic" ? "active" : ""}`}
                  onClick={() => setVisualStyle("cinematic")}
                >
                  <FaFilm /> Cinematic
                </button>
                <button 
                  className={`style-btn ${visualStyle === "animated" ? "active" : ""}`}
                  onClick={() => setVisualStyle("animated")}
                >
                  <FaMagic /> Animated
                </button>
              </div>
            </div>
          </div>

          {/* Book Info Section */}
          <div className="book-info-section">
            <div className="book-header">
              <h2 className="book-title">{visualBook.title}</h2>
              <p className="book-author">
                <FaUser /> {visualBook.author}
              </p>
              <p className="book-artist">
                <FaPalette /> Visual by: {visualBook.artist}
              </p>
              
              <div className="book-rating">
                {renderStars(visualBook.rating)}
                <span className="rating-value">({visualBook.reviews} reviews)</span>
              </div>
            </div>

            <div className="book-meta">
              <span><FaClock /> {visualBook.duration}</span>
              <span>📅 {visualBook.published}</span>
              <span>🎨 {visualBook.visualStyles.length} Visual Styles</span>
            </div>

            <p className={`book-description ${textAlign}`}>
              {visualBook.description}
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

            {/* Visual Highlights */}
            <div className="visual-highlights">
              <h4>Visual Highlights</h4>
              <div className="highlights-list">
                {visualBook.visualHighlights.map((highlight, index) => (
                  <div key={index} className="highlight-item">
                    <div className="highlight-time">⏱ {highlight.time}</div>
                    <div className="highlight-title">{highlight.title}</div>
                    <div className="highlight-type">{highlight.type}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="chapters-section">
          <h3>
            <FaList /> Chapters with Visuals
          </h3>
          <div className="chapters-grid">
            {visualBook.chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                className={`chapter-card ${currentChapter === index ? "active" : ""}`}
                onClick={() => selectChapter(index)}
              >
                <div className="chapter-thumbnail">
                  <div className="thumbnail-placeholder">
                    <FaFilm size={24} />
                  </div>
                  <div className="play-icon-overlay">
                    <FaPlay />
                  </div>
                </div>
                <div className="chapter-info">
                  <span className="chapter-number">Chapter {index + 1}</span>
                  <h4 className="chapter-title">{chapter.title}</h4>
                  <p className="chapter-description">{chapter.description}</p>
                  <span className="chapter-duration">{chapter.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h3>Visual Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h4>Multiple Visual Styles</h4>
              <p>Switch between illustration, cinematic, and animated styles</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h4>Interactive Transcripts</h4>
              <p>Follow along with highlighted text and key terms</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h4>Immersive Sound Design</h4>
              <p>Professional narration with ambient soundscapes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h4>Cross-Platform Sync</h4>
              <p>Continue watching on any device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualBookPage;