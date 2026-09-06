/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Avoid stranded static-generation child workers in constrained Windows environments.
    cpus: 1,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
