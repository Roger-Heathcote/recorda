let HtmlWebpackPlugin = require("html-webpack-plugin");
let WebpackBuildNotifierPlugin = require("webpack-build-notifier");

module.exports = {
    entry: "./source/app.js",
    output: {
        filename: "webpackbundle.js",
        path: "./build"
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "source/index.html",
            inject: "body"
        }),

        new WebpackBuildNotifierPlugin({
            title: "My Project Webpack Build",
            suppressSuccess: false
        })
    ]
};
