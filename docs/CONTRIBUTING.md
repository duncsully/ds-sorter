# Contributing
Feel free to create tickets for bugs or feature requests, or to submit PRs. (More guidance for contributing coming soon)

## Developing with ds-sorter

### Linting with ESLint, Prettier, and Types
To scan the project for linting errors
```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well
```bash
npm run lint:eslint
```
```bash
npm run lint:prettier
```

To automatically fix any linting errors
```bash
npm run format
```

You can format using ESLint and Prettier individually as well
```bash
npm run format:eslint
```
```bash
npm run format:prettier
```

### Testing with Web Test Runner
To run the suite of Web Test Runner tests
```bash
npm run test
```

To run the tests in watch mode

```bash
npm run test:watch
```

### Demoing with Storybook
To run a local instance of Storybook
```bash
npm run storybook
```

To build a production version of Storybook,
```bash
npm run storybook:build
```

### Local Demo with `web-dev-server`
```bash
npm start
```
To run a local development server that serves the basic demo located in `demo/index.html`
