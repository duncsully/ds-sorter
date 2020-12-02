```js script
import { html } from '@open-wc/demoing-storybook';
import '../dist/ds-orderer.js';

export default {
  title: 'DsOrderer',
  component: 'ds-orderer',
  options: { selectedPanel: "storybookjs/knobs/panel" },
};
```

# DsOrderer

A component for...

## Features:

- a
- b
- ...

## How to use

### Installation

```bash
yarn add ds-orderer
```

```js
import 'ds-orderer/ds-orderer.js';
```

```js preview-story
export const Simple = () => html`
  <ds-orderer></ds-orderer>
`;
```

## Variations

###### Custom Title

```js preview-story
export const CustomTitle = () => html`
  <ds-orderer title="Hello World"></ds-orderer>
`;
```
