module.exports = (api) => {
  api.cache(true);

  const presets = [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
    }],
    '@babel/preset-react',
  ];

  const plugins = [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-transform-class-static-block',
    '@babel/plugin-proposal-optional-chaining',
  ];

  return {
    presets,
    plugins,
  };
};
