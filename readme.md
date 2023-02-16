# preact-islands-diy

# Variants

- [webpack](https://github.com/barelyhuman/preact-islands-diy/tree/main)
- [esbuild](https://github.com/barelyhuman/preact-islands-diy/tree/esbuild-version) -
  [Caveats](#caveats-esbuild)

## Caveats of using ESbuild

Esbuild doesn't support splitting yet when trying to output cjs bundles which
makes it harder to support older browsers but should be fine with newer
browsers.

To know more about the status of splitting,
[evanw/esbuild#16](https://github.com/evanw/esbuild/issues/16)

# TODO

- [ ] A full guide of each folder and it's significance
- [ ] Variants
  - [x] ESBuild
  - [ ] Vite
