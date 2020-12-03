```js script
import { html } from '@open-wc/demoing-storybook';
import '../dist/ds-sorter.js';

export default {
  title: 'DsSorter',
  component: 'ds-sorter',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# DsSorter

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add ds-sorter
```

```js
import 'ds-sorter/ds-sorter.js';
```

```js preview-story
export const Simple = () => html`
  <ds-sorter></ds-sorter>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <ds-sorter title="Hello World"></ds-sorter>
`;
```
