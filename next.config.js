/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

/** @type {import("next").NextConfig} */
const config = {
  typescript:{
    ignoreBuildErrors: true,
  },
  eslint:{
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  images: {
    remotePatterns: [{hostname: 'assetprodj.s3.ap-southeast-1.amazonaws.com'}]
  }
};

export default config;
