Hello, and thanks in advance for contributing to maprayJS. Here's how we work. We haven't written a contributor guide or coding rules yet, so we will continue to enhance the content in the future.
This document first explains how to build maprayJS.

## Preparing your Development Environment
Yarn workspace is used in maprayJS.

Note: on MacOS it is often convenient to install yarn with brew
Install [yarn](https://yarnpkg.com/en/)
```bash
brew install yarn
```

Clone the repository:
```bash
git clone https://github.com/sony/mapray-js.git
```

To install dependencies:

Dependent packages are installed under ui and mapray packages.
```bash
cd mapray-js
yarn install
```
## Creating a Standalone Build
A standalone build allows you to turn the contents of this repository into mapray.js, mapray.mjs,maprayui.js, maprayui.mjs and mapray.css files that can be included on html pages through umd and es modules.

```bash
yarn build
```

### watch mode
Runnning automatic build when modified and updated source code under packages.

mapray package:

```bash
yarn mapray-watch
```

ui package:
```bash
yarn ui-watch
```

## Serving the application for development
You  can use our [applications](/apps/) for development.
- [Fall](/apps/fall/) 
- [Turning](/apps/turning/)
- [Rambler](/apps/rambler/)
