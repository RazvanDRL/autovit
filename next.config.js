/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'pub-6d5910db9c3d49d386074d553c5f4af0.r2.dev',
                port: '',
                pathname: '/*',
            },
        ],
    },
}

module.exports = nextConfig
