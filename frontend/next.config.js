/** @type {import('next').NextConfig} */
const nextConfig = {
  // 允許載入 Wikimedia 的塔羅牌圖片
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
}

module.exports = nextConfig
