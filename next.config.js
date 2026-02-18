/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow builds to complete even with ESLint warnings
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Allow builds to complete even with TypeScript errors (non-blocking)
    typescript: {
        ignoreBuildErrors: false,
    },
};

module.exports = nextConfig;
