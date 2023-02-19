# preact-islands-diy

## Variants

- [webpack](#webpack)
- [webpack-auto-inject](#webpack-auto-inject)
- [esbuild](#esbuild)
- [esbuild-auto-inject](#esbuild-auto-inject)

## Reasoning

This was built as a more modifiable approach for people who like to work with
codebases they can modify when things break down and it tries to keep down the
dependencies to the bare minimum where possible.

Also a lot more about why was something **I** built is something you can about
on the following blog post

[reaper - Updates and Decisions January - 2023](https://reaper.is/writing/20230207-decisions-and-updates-january-2023#preact-ssr)

## Guide

You can read about what and how to build your own using the following
[guide &rarr;](https://barelyhuman.github.io/preact-islands-diy/)

## Webpack

[&rarr; Branch: main](https://github.com/barelyhuman/preact-islands-diy/tree/main)

> Type: Verbose

Contains 2 simple webpack configurations that build the server and client and
you can manually decide what component hydrates on what DOM element.

Can work with older browsers since you select where and how the components
hydrate

## Webpack Auto Inject

[&rarr; Branch: webpack-auto-inject](https://github.com/barelyhuman/preact-islands-diy/tree/webpack-auto-inject)

> Type: Automatic

This one adds a tiny bit of magic by generating the island manifest for you and
also creating wrapper web-components that handle lazy loading and mounting the
islands for you.

This does provide better DX but if you are trying to understand how islands
work, do go through the [webpack](#webpack) and [esbuild](#esbuild) variants
instead.

## esbuild

[&rarr; Branch: esbuild-version](https://github.com/barelyhuman/preact-islands-diy/tree/esbuild-version)

> Type: Verbose

> **Warning**: esbuild doesn't support splitting with cjs right now which might
> be problematic with a few browsers so choose this if you strictly wish to work
> with modern browsers.

> **Note**: To know more about the status of splitting,
> [evanw/esbuild#16](https://github.com/evanw/esbuild/issues/16)

The variant uses a `build.mjs` script to handle something similar to what the
webpack setup does but is simpler in terms of setup and overall dependencies.

Can be further trimmed down by maintaining a programmatic manifest instead of
the one generated by the plugin

## esbuild-auto-inject

[&rarr; Branch: esbuild-auto-inject](https://github.com/barelyhuman/preact-islands-diy/tree/esbuild-auto-inject)

> Type: Verbose

The variant uses the same `build.mjs` as above but with a few changes where it
uses a helper plugin for esbuild to generate the island wrappers for you both on
client and by in-place modification for the server rendered island

This trims down the overall amount of tooling required as compared to webpack
but also there's a dependency on babel to generate escodegen compatible island
code on the server.

## License

[LICENSE](/license)

## More / Similar

- A real app approach with this starter
  [real-app-islands-diy](https://github.com/barelyhuman/real-app-islands-diy)

## Where to from here?

- You can help improve the speed of the plugins in each of the `*-auto-inject`
  branches
- Create you own apps and let us know about your experience and other pain
  points / frictions that you've experienced using this
- Build your own amazing starter template and tell us about it

# TODO

- [x] A full guide of each folder and it's significance
- [ ] Variants
  - [x] Webpack
  - [x] ESBuild
  - [ ] Vite
