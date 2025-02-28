import axios from 'axios';

// API service for TikTok downloader
const API_URL = 'https://api.ryzendesu.vip/api/downloader/v2/ttdl';

/**
 * Fetch TikTok video data from the API
 * @param {string} url - TikTok video URL
 * @returns {Promise} Promise with video data
 */
export const fetchTikTokData = async (url) => {
  try {
    const response = await axios.get(`${API_URL}?url=${encodeURIComponent(url)}`);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        message: 'Failed to fetch video data'
      };
    }
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Server error, please try again later'
    };
  }
};

/**
 * Download video file
 * @param {string} url - Video URL to download
 * @param {string} filename - Suggested filename for the download
 */
export const downloadVideo = (url, filename) => {
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'tiktok-video.mp4';
  document.body.appendChild(a);
  a.click();
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
  }, 100);
};

/**
 * Format large numbers to K, M format
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
