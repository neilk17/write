module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/main.js',
    target: 'electron-main',
    module: { rules: [] },
};
