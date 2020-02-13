const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SizePlugin = require('size-plugin');

function plugins() {
    var pluginsList = [
        // TODO: use handlebars to export html directly(where possible)
        new HtmlWebpackPlugin({
            template: './src/public/index.html',
            // inject: 'body',
            chunks: ['common'],
            // contentHash: isProd && customHash ? customHash : 'bundle', // app.bundle.js etc
            // isDevelopmentMode: !isProd,
            // clientVersion: packageJson.version
        }),
        new SizePlugin()
    ]
    return pluginsList;
}

function devServer() {
    return {
        compress: true,
        contentBase: './src/public',
        stats: { colors: true },
        // proxy: [{
        //     context: ['/api/**'],
        //     target: 'https://localhost:8703',
        //     secure: false
        // }],
        overlay: { warnings: false, errors: true },
        port: '8081',
        // https: true,
        historyApiFallback: {
            rewrites: [
                {
                    from: new RegExp('/(img/.*)'),
                    to: function (ruleInfo) {
                        return '/' + ruleInfo.match[1];
                    }
                },
                {
                    from: new RegExp('/.*'),
                    to: '/index.html'
                }
            ]
        }
    };
}

function devConfig() {
    return {
        entry: {
            common: `./src/common.js`,
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: plugins(),
        devServer: devServer(),
        resolve: {
            modules: [path.resolve(__dirname, 'src'), 'node_modules']
        },
        module: {
            rules: [{
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }],
            }, {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            }, {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: 'file-loader'
            }]
        }
    };
}

module.exports = () => {
    return [devConfig()]
};
