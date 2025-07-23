/** @type {import('next').NextConfig} */
const nextConfig = {
// Removed 'output: "export"' and 'trailingSlash: true' for local development
// and App Router default behavior.
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
images: {
  unoptimized: true
},
// Removed assetPrefix as it's typically for static exports/CDN
}

export default nextConfig
