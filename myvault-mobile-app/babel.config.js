module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add this line
    '@babel/plugin-transform-export-namespace-from',
  ],
};
