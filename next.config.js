/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-5e0f9c3c28524b78a12ca8f84bfb76d5.r2.dev',
                port: '',
                pathname: '/*/**',
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
        domains: ['secure.twispay.com', 'secure-stage.twispay.com'],
    },
}

module.exports = nextConfig
