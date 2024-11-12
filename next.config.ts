/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Permissions-Policy',
                        value: 'private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()'
                    }
                ],
            },
        ]
    },
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
    },
}

module.exports = nextConfig
