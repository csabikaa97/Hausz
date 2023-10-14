const path = require('path');

module.exports = {
  experiments: {
    asyncWebAssembly: true
  },
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'sha256_library',
      type: 'var',
    },
  },
  resolve: {
    fallback: {
        fs: false,
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
        "path": require.resolve("path-browserify")
    },
  },
};