# \<ds-sorter>

A web component for sorting elements

This web component follows the [open-wc](https://github.com/open-wc/open-wc) recommendations.

## Installation
```bash
npm i ds-sorter
```

## Usage
```html
<script type="module">
  import 'ds-sorter/dist/ds-sorter.js';
</script>

<ds-sorter>
  <!-- Put elements to be sorted here -->
</ds-sorter>
```

## API
### Properties

| Property     | Attribute    | Type                                             | Default                 | Description                                      |
|--------------|--------------|--------------------------------------------------|-------------------------|--------------------------------------------------|
| `by`         | `by`         | `string`                                         |                         | A list of comma-separated rules to sort by in order of precedence. <br/>Specify attributes by name (e.g. "href"). If specifying a property, prepend with "." (e.g. ".innerText"). You can use nested properties as well (e.g. ".dataset.row"). <br/>Optionally, if you'd like to reverse a rule relative to the others, prepend a ">" (e.g. "href, >.innerText"). <br/>Finally, if you'd like to get a value of a descendant of the sorted element, wrap a selector in braces before the value and modifiers (e.g. {div label input} .checked). |
| `comparator` |              | `((a: HTMLElement, b: HTMLElement) => number) \| undefined` | undefined             | Custom [comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) for sorting |
| `descending` | `descending` | `boolean`                                        | false                   | Sort in descending order (else ascending is default) |
| `random`     | `random`     | `boolean`                                        | false                   | If present, sorts randomly                       |
| `rules`      | `rules`      | `Rule[]`                                         | [{"key":["innerText"]}] | A list of rule objects to sort the elements by. Refer to Rule interface for properties. |

### Rule Interface

| Property   | Type                | Description |
|------------|---------------------|-------------|
| `key`      | `string \| string[]` | Attribute name, or array representing a path of properties. (e.g. el.innerText -> ['innerText'] or el.someObj.someChild.someGrandchild -> ['someObj', 'someChild', 'someGrandchild'])  </br>Note: Changes to values of sorted attributes will trigger a re-sort. Changes to sorted properties will not. |
| `selector` | `string?`           | Selector for descendant to get attribute/property off of |
| `reverse`  | `string?`           | If true, sort in reverse order relative to the global sort direction |

### Methods

| Method | Type       |
|--------|------------|
| `sort` | `(): void` |

### Events

| Event     | Description |
|-----------|-------------|
| `ds-sort` | Fired after a sort has completed |

### Slots

| Name | Description     |
|------|-----------------|
|      | Content to sort |

## Contributing

Feel free to create tickets for bugs or feature requests, or to submit PRs. Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for more information about developing in ds-sorter.