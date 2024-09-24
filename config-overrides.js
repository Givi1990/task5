// config-overrides.js
module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer/"),
    };
    return config;
};
