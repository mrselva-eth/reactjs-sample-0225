/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Allow reCAPTCHA iframe
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: Include Magic SDK, ReCAPTCHA, RainbowKit and blockchain RPC endpoints
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://*.magic.link https://cdn.walletconnect.com",
              // Styles: Include Google services and Magic SDK
              "style-src 'self' 'unsafe-inline' https://www.google.com https://*.magic.link",
              // Images: Include all necessary services
              "img-src 'self' data: https: https://www.google.com https://*.magic.link",
              // Frames: Include reCAPTCHA and Magic SDK iframes
              "frame-src 'self' https://www.google.com https://*.magic.link https://verify.walletconnect.com",
              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect: Include all API endpoints, services and blockchain RPC endpoints
              "connect-src 'self' https://*.vercel-storage.com https://www.google.com https://*.magic.link https://*.walletconnect.com wss://*.walletconnect.com https://rpc-mainnet.maticvigil.com https://*.pinata.cloud https://gateway.pinata.cloud https://eth.merkle.io https://rpc.ankr.com wss://eth.merkle.io https://pulse.walletconnect.org https://euc.li",
              // Web3 connections
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              // Media
              "media-src 'self' https://*.magic.link",
              // Manifest
              "manifest-src 'self'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

