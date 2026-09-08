/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/analytics",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
