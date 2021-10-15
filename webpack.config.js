const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, 'index.js'),
  },
  stats: { warnings: false, children: false, modules: false },
};
