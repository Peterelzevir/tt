import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ReactPlayer from 'react-player';
import { FiDownload, FiCopy, FiCheck, FiLoader, FiMusic, FiUser, FiHeart, FiMessageCircle, FiShare2, FiInfo, FiSave } from 'react-icons/fi';
import { fetchTikTokData, downloadVideo, formatNumber, formatDate } from './download';

// Konfigurasi animasi
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

// Komponen ScrollReveal untuk animasi pada scroll
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

// Komponen Utama TikTok Downloader
const TikTokDownloader = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeDownload, setActiveDownload] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const headerRef = useRef(null);
  
  // Menangani perubahan input URL
  const handleInputChange = (e) => {
    setUrl(e.target.value);
    // Reset hasil sebelumnya ketika input berubah
    if (videoData) {
      setVideoData(null);
    }
    if (error) {
      setError('');
    }
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
    setActiveDownload(type);
    
    // Membuat link unduhan
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tiktok-${type}-${Date.now()}.mp4`);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    
    // Memulai unduhan
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      setActiveDownload(null);
      
      // Menampilkan pesan sukses
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1000);
  };

  // Menangani penyalinan URL ke clipboard
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
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
            <div className="relative flex flex-col md:flex-row gap-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Tempel URL video TikTok di sini..."
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
                  'Unduh'
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

      {/* Animasi Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
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

      {/* Pemberitahuan Unduhan Berhasil */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center"
          >
            <FiCheck className="mr-2" />
            Video sedang diunduh ke perangkat Anda!
          </motion.div>
        )}
      </AnimatePresence>

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
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="bg-black/30 backdrop-blur-lg rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl"
            >
              {/* Preview Video dan Info */}
              <div className="flex flex-col lg:flex-row">
                {/* Preview Video */}
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

                {/* Info Video */}
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

                  {/* Tombol Unduhan */}
                  <ScrollReveal>
                    <div className="space-y-4 mb-6">
                      <h3 className="text-xl font-semibold mb-4">Pilihan Unduhan</h3>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(videoData.video_data.nwm_video_url, 'tanpa-watermark')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FiDownload className="mr-2" />
                          Unduh Tanpa Watermark
                        </span>
                        {activeDownload === 'tanpa-watermark' ? (
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
                        onClick={() => handleDownload(videoData.video_data.wm_video_url, 'dengan-watermark')}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FiDownload className="mr-2" />
                          Unduh Dengan Watermark
                        </span>
                        {activeDownload === 'dengan-watermark' ? (
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
            Cara Mengunduh Video TikTok
          </h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-purple-600 rounded-full mb-6 text-2xl">1</div>
              <h3 className="text-xl font-bold mb-4">Salin Link TikTok</h3>
              <p className="text-gray-300">Buka aplikasi atau situs TikTok, temukan video yang ingin Anda unduh, dan salin link bagikan.</p>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-pink-600 rounded-full mb-6 text-2xl">2</div>
              <h3 className="text-xl font-bold mb-4">Tempel URL</h3>
              <p className="text-gray-300">Tempel URL video TikTok yang telah disalin ke dalam kolom input di atas dan klik tombol Unduh.</p>
            </motion.div>
          </ScrollReveal>
          
          <ScrollReveal>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-indigo-600 rounded-full mb-6 text-2xl">3</div>
              <h3 className="text-xl font-bold mb-4">Unduh Video</h3>
              <p className="text-gray-300">Pratinjau video dan pilih opsi unduhan yang Anda inginkan - dengan atau tanpa watermark.</p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
      
      {/* Bagian Fitur */}
      <div className="bg-gradient-to-b from-transparent to-black/40">
        <div className="container mx-auto px-4 py-20">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
              Fitur Premium
            </h2>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FiHeart, title: "Tanpa Watermark", desc: "Hapus watermark TikTok dari video" },
              { icon: FiUser, title: "Gratis Digunakan", desc: "Tanpa registrasi atau pembayaran" },
              { icon: FiMessageCircle, title: "Kualitas HD", desc: "Unduh video dengan kualitas tinggi" },
              { icon: FiShare2, title: "Unduhan Tak Terbatas", desc: "Tanpa batasan jumlah unduhan" }
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
      
      {/* Bagian FAQ */}
      <div className="container mx-auto px-4 py-20">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-purple-200 text-transparent bg-clip-text">
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
          <p className="text-gray-400">© 2025 TikTok Downloader. Tidak berafiliasi dengan TikTok.</p>
          <p className="text-gray-500 text-sm mt-2">Layanan ini hanya untuk penggunaan pribadi.</p>
          <p className="text-purple-400 text-sm mt-4">by peter</p>
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
