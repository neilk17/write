module.exports = {
    mode: process.env.NODE_ENV || 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-react', { runtime: 'automatic' }], // React 18 transform
                        ],
                    },
                },
            },
        ],
    },
    resolve: { extensions: ['.js', '.jsx'] },
};
