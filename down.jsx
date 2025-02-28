import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ReactPlayer from 'react-player';
import { FiDownload, FiCopy, FiCheck, FiLoader, FiMusic, FiUser, FiHeart, FiMessageCircle, FiShare2, FiInfo } from 'react-icons/fi';
import { fetchTikTokData, downloadVideo, formatNumber, formatDate } from './download';

// Animations configuration
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1.5, repeat: Infinity }
};

// ScrollReveal component for animation on scroll
const ScrollReveal = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
};

// Main TikTok Downloader Component
const TikTokDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeDownload, setActiveDownload] = useState(null);
  const headerRef = useRef(null);
  
  // Handle URL input change
  const handleInputChange = (e) => {
    setUrl(e.target.value);
    // Reset previous results when input changes
    if (videoData) {
      setVideoData(null);
    }
    if (error) {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a TikTok URL');
      return;
    }
    
    if (!url.includes('tiktok.com')) {
      setError('Please enter a valid TikTok URL');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setVideoData(null);
    
    try {
      const result = await fetchTikTokData(url);
      
      if (result.success) {
        setVideoData(result.data);
        // Scroll to results after loading
        setTimeout(() => {
          window.scrollTo({
            top: headerRef.current.offsetHeight,
            behavior: 'smooth'
          });
        }, 500);
      } else {
        setError(result.message || 'Failed to fetch video data');
      }
    } catch (err) {
      setError('Server error, please try again later');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video download
  const handleDownload = (url, type) => {
    setActiveDownload(type);
    setTimeout(() => {
      downloadVideo(url, `tiktok-${type}-${Date.now()}.mp4`);
      setActiveDownload(null);
    }, 1000);
  };

  // Handle copying URL to clipboard
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen text-white overflow-hidden">
      {/* Header */}
      <header ref={headerRef} className="relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-r from-purple-800/20 via-fuchsia-600/20 to-pink-600/20 backdrop-blur-sm"
        />
        
        <div className="relative container mx-auto px-4 py-20 text-center z-10">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 text-transparent bg-clip-text mb-4">
              TikTok Downloader
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto mb-8">
              Download TikTok videos without watermark in HD quality
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative flex flex-col md:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Paste TikTok video URL here..."
                className="flex-grow p-4 pl-6 bg-transparent text-white placeholder-purple-300 outline-none border-none rounded-xl"
              />
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <motion.span 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    <FiLoader className="mr-2 inline" />
                  </motion.span>
                ) : (
                  'Download'
                )}
              </motion.button>
            </div>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 mt-4"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
          
          {/* Floating shapes for decoration */}
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute top-20 left-10 w-20 h-20 rounded-full bg-purple-500/20 blur-xl"
          />
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -7, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-pink-500/20 blur-xl"
          />
        </div>
      </header>

      {/* Loading animation */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <motion.div 
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
            className="w-24 h-24 border-t-4 border-l-4 border-purple-500 rounded-full"
          />
        </div>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {videoData && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-10"
          >
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-lg rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl"
            >
              {/* Video Preview and Info */}
              <div className="flex flex-col lg:flex-row">
                {/* Video Preview */}
                <ScrollReveal>
                  <div className="lg:w-1/2 relative overflow-hidden">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="aspect-[9/16] max-h-[70vh] relative overflow-hidden rounded-2xl m-6"
                    >
                      <ReactPlayer
                        url={videoData.video_data.nwm_video_url}
                        controls
                        playing
                        loop
                        width="100%"
                        height="100%"
                        style={{ borderRadius: '16px' }}
                        className="rounded-2xl"
                      />
                    </motion.div>
                  </div>
                </ScrollReveal>

                {/* Video Info */}
                <div className="lg:w-1/2 p-6">
                  <ScrollReveal>
                    <div className="flex items-center mb-6">
                      <img 
                        src={videoData.author.avatar_medium.url_list[0]} 
                        alt={videoData.author.nickname}
                        className="w-12 h-12 rounded-full border-2 border-purple-500"
                      />
                      <div className="ml-4">
                        <h3 className="font-bold text-xl">{videoData.author.nickname}</h3>
                        <p className="text-gray-400 text-sm">@{videoData.author.unique_id}</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal>
                    <p className="text-gray-300 mb-6">{videoData.desc}</p>
                  </ScrollReveal>

                  <ScrollReveal>
                    <div className="flex items-center mb-6">
                      <div className="mr-6 flex items-center">
                        <FiMusic className="text-pink-500 mr-2" />
                        <span className="text-sm text-gray-300">{videoData.music.title} - {videoData.music.author}</span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="text-purple-500 mr-2" />
                        <span className="text-sm text-gray-300">{formatDate(videoData.create_time)}</span>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Download Buttons */}
                  <ScrollReveal>
                    <div className="space-y-4 mb-6">
                      <h3 className="text-xl font-semibold mb-4">Download Options</h3>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(videoData.video_data.nwm_video_url, 'no-watermark')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FiDownload className="mr-2" />
                          Download Without Watermark
                        </span>
                        {activeDownload === 'no-watermark' ? (
                          <motion.span animate={pulse}>
                            <FiLoader className="animate-spin" />
                          </motion.span>
                        ) : (
                          <span className="text-sm bg-black/20 px-3 py-1 rounded-full">HD</span>
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(videoData.video_data.wm_video_url, 'watermark')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FiDownload className="mr-2" />
                          Download With Watermark
                        </span>
                        {activeDownload === 'watermark' ? (
                          <motion.span animate={pulse}>
                            <FiLoader className="animate-spin" />
                          </motion.span>
                        ) : (
                          <span className="text-sm bg-black/20 px-3 py-1 rounded-full">Original</span>
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCopy(videoData.video_data.nwm_video_url)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          {copied ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
                          {copied ? 'Copied to clipboard!' : 'Copy video URL'}
                        </span>
                        <span className="text-sm bg-black/20 px-3 py-1 rounded-full">Link</span>
                      </motion.button>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* How to Use Section */}
      <div className="container mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
            How to Download TikTok Videos
          </h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-purple-600 rounded-full mb-6 text-2xl">1</div>
              <h3 className="text-xl font-bold mb-4">Copy TikTok Link</h3>
              <p className="text-gray-300">Open TikTok app or website, find the video you want to download, and copy the share link.</p>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-pink-600 rounded-full mb-6 text-2xl">2</div>
              <h3 className="text-xl font-bold mb-4">Paste URL</h3>
              <p className="text-gray-300">Paste the copied TikTok video URL into the input field above and click Download button.</p>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-indigo-600 rounded-full mb-6 text-2xl">3</div>
              <h3 className="text-xl font-bold mb-4">Download Video</h3>
              <p className="text-gray-300">Preview the video and choose the download option you prefer - with or without watermark.</p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-gradient-to-b from-transparent to-black/40">
        <div className="container mx-auto px-4 py-20">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
              Premium Features
            </h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FiHeart, title: "No Watermark", desc: "Remove TikTok watermark from videos" },
              { icon: FiUser, title: "Free to Use", desc: "No registration or payment required" },
              { icon: FiMessageCircle, title: "HD Quality", desc: "Download videos in high quality" },
              { icon: FiShare2, title: "Unlimited Downloads", desc: "No restrictions on downloads" }
            ].map((feature, index) => (
              <ScrollReveal key={index}>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl"
                >
                  <feature.icon className="text-3xl text-pink-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { 
              q: "Is it free to download TikTok videos?", 
              a: "Yes, our service is completely free to use. You can download unlimited TikTok videos without any cost." 
            },
            { 
              q: "Can I download TikTok videos without watermark?", 
              a: "Yes, our downloader provides options to download videos with or without the TikTok watermark in high quality." 
            },
            { 
              q: "Is it legal to download TikTok videos?", 
              a: "Downloading videos for personal use is generally acceptable, but redistributing or using them commercially without permission may violate copyright laws." 
            },
            { 
              q: "Why can't I download some TikTok videos?", 
              a: "Some videos may be private or from accounts with restricted sharing settings, which can prevent our service from accessing them." 
            }
          ].map((faq, index) => (
            <ScrollReveal key={index}>
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
              >
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <FiInfo className="text-pink-500 mr-2" />
                  {faq.q}
                </h3>
                <p className="text-gray-300">{faq.a}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 TikTok Downloader. Not affiliated with TikTok.</p>
          <p className="text-gray-500 text-sm mt-2">This service is for personal use only.</p>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 p-4 bg-purple-600 rounded-full shadow-lg text-white z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikTokDownloader;
