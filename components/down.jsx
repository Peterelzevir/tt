import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ReactPlayer from 'react-player';
import { FiDownload, FiCopy, FiCheck, FiLoader, FiMusic, FiUser, FiHeart, FiMessageCircle, FiShare2, FiInfo, FiX } from 'react-icons/fi';
import { fetchTikTokData, downloadVideo, formatNumber, formatDate } from './download';

// Komponen Loading Awal
const InitialLoading = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="w-24 h-24 mb-8"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 15 A35 35 0 1 1 49.9 15"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            className="loading-path"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
      >
        TikTok Downloader
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-gray-400"
      >
        Memuat aplikasi...
      </motion.p>
    </motion.div>
  );
};

// Komponen ParticleBackground
const ParticleBackground = () => {
  const particlesRef = useRef([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Buat partikel dengan ukuran, posisi, dan animasi acak
  const particleCount = 20;
  
  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }).map(() => ({
      size: Math.random() * 80 + 20,
      x: Math.random() * windowSize.width,
      y: Math.random() * windowSize.height,
      duration: Math.random() * 50 + 30,
      delay: Math.random() * 20
    }));
  }, [windowSize, particleCount]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {particlesRef.current.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-purple-500/5"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
};

// Komponen ScrollReveal untuk animasi pada scroll
const ScrollReveal = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6,
            delay: delay * 0.1
          } 
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Komponen FiCalendar kustom
const FiCalendar = (props) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Komponen Toast Notification
const Toast = ({ message, type, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
      <span className="text-white font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white transition-colors"
      >
        <FiX />
      </button>
    </motion.div>
  );
};

// Komponen Utama TikTok Downloader
const TikTokDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const headerRef = useRef(null);
  
  // Simulasi loading awal
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // Menangani perubahan input URL
  const handleInputChange = (e) => {
    setUrl(e.target.value);
    if (videoData) setVideoData(null);
    if (error) setError('');
  };

  // Menangani pengiriman formulir
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Harap masukkan URL TikTok');
      return;
    }
    
    if (!url.includes('tiktok.com')) {
      setError('Harap masukkan URL TikTok yang valid');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setVideoData(null);
    
    try {
      const result = await fetchTikTokData(url);
      
      if (result.success) {
        setVideoData(result.data);
        // Scroll ke hasil setelah loading
        setTimeout(() => {
          window.scrollTo({
            top: headerRef.current.offsetHeight,
            behavior: 'smooth'
          });
        }, 500);
      } else {
        setError(result.message || 'Gagal mengambil data video');
      }
    } catch (err) {
      setError('Kesalahan server, silakan coba lagi nanti');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengunduh video langsung ke perangkat
  const handleDownload = (url, type) => {
    try {
      // Membuat elemen <a> tersembunyi
      const link = document.createElement('a');
      link.href = url;
      link.download = `tiktok-${type}-${Date.now()}.mp4`;
      document.body.appendChild(link);
      
      // Klik link untuk memulai unduhan
      link.click();
      
      // Hapus elemen setelah digunakan
      document.body.removeChild(link);
      
      // Tampilkan toast sukses
      setToast({
        type: 'success',
        message: 'Video sedang diunduh ke perangkat Anda!'
      });
    } catch (error) {
      console.error('Gagal mengunduh:', error);
      setToast({
        type: 'error',
        message: 'Gagal mengunduh video, coba lagi!'
      });
    }
  };

  // Menangani penyalinan URL ke clipboard
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setToast({
      type: 'success',
      message: 'URL berhasil disalin ke clipboard!'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Tutup toast notification
  const closeToast = () => {
    setToast(null);
  };

  // Visibilitas tombol scroll ke atas
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fungsi scroll ke atas
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <AnimatePresence>
        {showInitialLoading && <InitialLoading />}
      </AnimatePresence>
      
      <ParticleBackground />
      
      <div className="min-h-screen text-white overflow-hidden">
        {/* Header */}
        <header ref={headerRef} className="relative overflow-hidden pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-fuchsia-900/20 to-pink-900/30 backdrop-blur-sm"
          />
          
          <div className="relative container mx-auto px-4 text-center z-10">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 neon-text"
                animate={{
                  textShadow: [
                    "0 0 7px #fff, 0 0 10px #fff, 0 0 15px #9333ea, 0 0 20px #9333ea",
                    "0 0 7px #fff, 0 0 10px #fff, 0 0 15px #ec4899, 0 0 20px #ec4899",
                    "0 0 7px #fff, 0 0 10px #fff, 0 0 15px #9333ea, 0 0 20px #9333ea"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                TikTok Downloader
              </motion.h1>
              <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto mb-12">
                Unduh video TikTok tanpa watermark dengan kualitas HD
              </p>
            </motion.div>

            {/* Form Pencarian */}
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="relative flex flex-col md:flex-row gap-4 p-3 glass rounded-2xl shadow-2xl">
                <input
                  type="text"
                  value={url}
                  onChange={handleInputChange}
                  placeholder="Tempel URL video TikTok di sini..."
                  className="flex-grow p-5 bg-white/5 text-white placeholder-purple-300 outline-none border-none rounded-xl"
                />
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-gradient py-5 px-8 md:w-auto w-full"
                >
                  {isLoading ? (
                    <motion.span 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block"
                    >
                      <FiLoader className="mr-2 inline" />
                      Memuat...
                    </motion.span>
                  ) : (
                    'Unduh Sekarang'
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
            
            {/* Bentuk mengambang untuk dekorasi */}
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
              className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
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
              className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-pink-500/10 blur-xl"
            />
          </div>
        </header>

        {/* Animasi Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-spinner"></div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-purple-300"
            >
              Memuat video TikTok...
            </motion.p>
          </div>
        )}

        {/* Bagian Hasil */}
        <AnimatePresence>
          {videoData && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-10"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
                className="glass-dark rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Preview Video dan Info */}
                <div className="flex flex-col lg:flex-row">
                  {/* Preview Video */}
                  <ScrollReveal delay={0}>
                    <div className="lg:w-1/2 relative overflow-hidden">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="video-container m-6"
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

                  {/* Info Video */}
                  <div className="lg:w-1/2 p-6">
                    <ScrollReveal delay={1}>
                      <div className="flex items-center mb-6">
                        <img 
                          src={videoData.author.avatar_medium.url_list[0]} 
                          alt={videoData.author.nickname}
                          className="w-12 h-12 rounded-full avatar-glow"
                        />
                        <div className="ml-4">
                          <h3 className="font-bold text-xl">{videoData.author.nickname}</h3>
                          <p className="text-gray-400 text-sm">@{videoData.author.unique_id}</p>
                        </div>
                      </div>
                    </ScrollReveal>

                    <ScrollReveal delay={2}>
                      <p className="text-gray-300 mb-6">{videoData.desc}</p>
                    </ScrollReveal>

                    <ScrollReveal delay={3}>
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center">
                          <FiMusic className="text-pink-500 mr-2" />
                          <span className="text-sm text-gray-300">{videoData.music.title} - {videoData.music.author}</span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="text-purple-500 mr-2" />
                          <span className="text-sm text-gray-300">{formatDate(videoData.create_time)}</span>
                        </div>
                      </div>
                    </ScrollReveal>

                    {/* Tombol Unduhan */}
                    <ScrollReveal delay={4}>
                      <div className="space-y-4 mb-6">
                        <h3 className="text-xl font-semibold mb-6 text-gradient">Pilihan Unduhan</h3>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDownload(videoData.video_data.nwm_video_url, 'tanpa-watermark')}
                          className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-between hover-card"
                        >
                          <span className="flex items-center">
                            <FiDownload className="mr-3 text-xl" />
                            Unduh Tanpa Watermark
                          </span>
                          <span className="text-sm bg-black/20 px-3 py-1 rounded-full">HD</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDownload(videoData.video_data.wm_video_url, 'dengan-watermark')}
                          className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-between hover-card"
                        >
                          <span className="flex items-center">
                            <FiDownload className="mr-3 text-xl" />
                            Unduh Dengan Watermark
                          </span>
                          <span className="text-sm bg-black/20 px-3 py-1 rounded-full">Original</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCopy(videoData.video_data.nwm_video_url)}
                          className="w-full py-4 px-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl flex items-center justify-between hover-card"
                        >
                          <span className="flex items-center">
                            {copied ? <FiCheck className="mr-3 text-xl" /> : <FiCopy className="mr-3 text-xl" />}
                            {copied ? 'Disalin ke clipboard!' : 'Salin URL video'}
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
        
        {/* Bagian Cara Menggunakan */}
        <div className="container mx-auto px-4 py-20">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Cara Mengunduh Video TikTok
            </h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={1}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-purple p-8 rounded-2xl hover-card"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-full mb-6 text-2xl">1</div>
                <h3 className="text-xl font-bold mb-4">Salin Link TikTok</h3>
                <p className="text-gray-300">Buka aplikasi atau situs TikTok, temukan video yang ingin Anda unduh, dan salin link bagikan.</p>
              </motion.div>
            </ScrollReveal>
            
            <ScrollReveal delay={2}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-purple p-8 rounded-2xl hover-card"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-pink-600 to-pink-800 rounded-full mb-6 text-2xl">2</div>
                <h3 className="text-xl font-bold mb-4">Tempel URL</h3>
                <p className="text-gray-300">Tempel URL video TikTok yang telah disalin ke dalam kolom input di atas dan klik tombol Unduh Sekarang.</p>
              </motion.div>
            </ScrollReveal>
            
            <ScrollReveal delay={3}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-purple p-8 rounded-2xl hover-card"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-full mb-6 text-2xl">3</div>
                <h3 className="text-xl font-bold mb-4">Unduh Video</h3>
                <p className="text-gray-300">Pratinjau video dan pilih opsi unduhan yang Anda inginkan - video akan langsung terunduh ke perangkat Anda.</p>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Bagian Fitur */}
        <div className="bg-gradient-to-b from-transparent to-black/40 py-20">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
                Fitur Premium
              </h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: FiHeart, 
                  title: "Tanpa Watermark", 
                  desc: "Hapus watermark TikTok dari video",
                  gradient: "from-purple-600 to-pink-600"
                },
                { 
                  icon: FiUser, 
                  title: "Gratis Digunakan", 
                  desc: "Tanpa registrasi atau pembayaran",
                  gradient: "from-pink-600 to-red-600"
                },
                { 
                  icon: FiMessageCircle, 
                  title: "Kualitas HD", 
                  desc: "Unduh video dengan kualitas tinggi",
                  gradient: "from-blue-600 to-indigo-600"
                },
                { 
                  icon: FiShare2, 
                  title: "Unduhan Langsung", 
                  desc: "Langsung ke perangkat tanpa batasan",
                  gradient: "from-indigo-600 to-purple-600"
                }
              ].map((feature, index) => (
                <ScrollReveal key={index} delay={index + 1}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="glass p-6 rounded-2xl border border-white/10 shadow-xl hover-card relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10`}></div>
                    <div className="relative z-10">
                      <feature.icon className="text-3xl text-gradient mb-4" />
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-300">{feature.desc}</p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bagian FAQ */}
        <div className="container mx-auto px-4 py-20">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
              Pertanyaan yang Sering Diajukan
            </h2>
          </ScrollReveal>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { 
                q: "Apakah gratis untuk mengunduh video TikTok?", 
                a: "Ya, layanan kami sepenuhnya gratis untuk digunakan. Anda dapat mengunduh video TikTok tanpa batas tanpa biaya apapun." 
              },
              { 
                q: "Bisakah saya mengunduh video TikTok tanpa watermark?", 
                a: "Ya, downloader kami menyediakan opsi untuk mengunduh video dengan atau tanpa watermark TikTok dengan kualitas tinggi." 
              },
              { 
                q: "Apakah legal untuk mengunduh video TikTok?", 
                a: "Mengunduh video untuk penggunaan pribadi umumnya dapat diterima, tetapi mendistribusikan ulang atau menggunakannya secara komersial tanpa izin dapat melanggar hukum hak cipta." 
              },
              { 
                q: "Mengapa saya tidak dapat mengunduh beberapa video TikTok?", 
                a: "Beberapa video mungkin bersifat pribadi atau dari akun dengan pengaturan berbagi terbatas, yang dapat mencegah layanan kami mengaksesnya." 
              },
              { 
                q: "Apakah video langsung terunduh ke perangkat saya?", 
                a: "Ya, semua video langsung terunduh ke perangkat Anda. Tidak ada langkah tambahan yang diperlukan setelah mengklik tombol unduh." 
              }
            ].map((faq, index) => (
              <ScrollReveal key={index} delay={index}>
                <motion.div 
                  whileHover={{ y: -2 }}
                  className="glass p-8 rounded-2xl hover-card"
                >
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <FiInfo className="text-pink-500 mr-3" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-300">{faq.a}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-black/50 backdrop-blur-md py-10 border-t border-purple-900/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">© 2025 TikTok Downloader. Tidak berafiliasi dengan TikTok.</p>
            <p className="text-gray-500 text-sm mt-2">Layanan ini hanya untuk penggunaan pribadi.</p>
            <p className="text-gradient font-medium text-sm mt-4">by peter</p>
          </div>
        </footer>
        
        {/* Tombol scroll ke atas */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-10 right-10 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg text-white z-30"
              whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(168, 85, 247, 0.7)" }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={closeToast} 
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default TikTokDownloader;
