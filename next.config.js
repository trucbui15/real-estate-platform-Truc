/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // build gọn cho Docker (chỉ copy đúng phần cần chạy, không copy cả node_modules)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
module.exports = nextConfig;
