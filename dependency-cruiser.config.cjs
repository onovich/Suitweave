module.exports = { forbidden: [
  { name: 'domain-is-pure', from: { path: '^src/domain' }, to: { path: '^src/(application|platform|ui)' } },
  { name: 'application-no-ui', from: { path: '^src/application' }, to: { path: '^src/(platform|ui)' } },
  { name: 'platform-no-ui', from: { path: '^src/platform' }, to: { path: '^src/ui' } },
  { name: 'no-cycles', severity: 'error', from: {}, to: { circular: true } }
], options: { doNotFollow: { path: 'node_modules' }, tsConfig: { fileName: 'tsconfig.app.json' } } };
