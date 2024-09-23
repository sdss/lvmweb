import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    serverActions: {
      allowedForwardedHosts: ['localhost', '10.8.38.21', 'lvm-hub', 'lvm-hub.lco.cl'],
      allowedOrigins: [
        'localhost:8080',
        '10.8.38.21:8080',
        'lvm-hub:8080',
        'lvm-hub.lco.cl:8080',
      ],
    },
  },
  trailingSlash: true,
  basePath: '',
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/overview',
        permanent: true,
      },
    ];
  },
});
