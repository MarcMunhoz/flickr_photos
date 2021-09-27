require("dotenv").config();
const webpack = require("webpack");

module.exports = {
  devServer: {
    port: 2469,
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    return { plugins: [new webpack.EnvironmentPlugin({ ...process.env })] };
  },
};
