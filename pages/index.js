import React from 'react';
import TikTokDownloader from '../components/down';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Head>
        <title>TikTok Downloader - Download TikTok Videos Without Watermark</title>
        <meta name="description" content="Free online tool to download TikTok videos without watermark in HD quality." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <TikTokDownloader />
    </div>
  );
}