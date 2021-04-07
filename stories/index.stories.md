```js script
import { html, withKnobs, withWebComponentsKnobs, text, array, boolean } from '@open-wc/demoing-storybook';
import '../dist/ds-sorter.js';

export default {
  title: 'DsSorter',
  component: 'ds-sorter',
  options: { selectedPanel: "storybookjs/knobs/panel" },
  decorators: [withKnobs],
  parameters: {
    knobs: {
      escapeHTML: false
    }
  }
};
```

# DsSorter

A Web Component that allows you to easily sort elements.

## Features:

- Random sorting
- Sort by any number of element attributes or properties
- Automatically re-sort on attribute changes or new elements added
- Optionally provide own sort comparison function

## How to use

### Installation

```bash
# With NPM
npm install ds-sorter

# Or with Yarn
yarn add ds-sorter
```

### Importing
```js
import 'ds-sorter/ds-sorter.js';
```

## API
<sb-props of="ds-sorter"></sb-props>

### Methods
#### sort()
Manually triggers a sort
<!-- TODO: Come up with a better playground example? 
## Playground
```js preview-story
export const Playground = ({ random, by, comparator, descending}) => html`
  <ds-sorter ?random=${boolean('random', true)} by=${text('by', 'class')} .comparator=${comparator} ?descending=${boolean('descending', false)}>
    <div class="B"><p class="A"><span class="C">div B, p A, span C</span></p></div>
    <div class="C"><p class="B"><span class="A">div C, p B, span A</span></p></div>
    <div class="A"><p class="C"><span class="B">div A, p C, span B</span></p></div>
  </ds-sorter>
`
```
-->

## Examples

###### Default
By default, the elements are sorted by their text content in alphabetical order (or more accurately by the contents' UTF-16 code units order)
```js preview-story
export const Default = () => html`
  <ds-sorter>
    <p>B. This paragraph is defined first, but should be sorted to be second!</p>
    <p>C. Don't believe me? Look at the code!</p>
    <p>A. By default, elements are sorted by alphabetically by .innerText.</p>
  </ds-sorter>
`;
```

###### Random
Adding the ``random`` attribute will make DsSorter sort elements randomly. This attribute trumps all others.

```js preview-story
export const Random = () => html`
  <ds-sorter random>
  <p>1</p>
  <p>2</p>
  <p>3</p>
  <p>4</p>
  <p>5</p>
  </ds-sorter>
`;
```

###### By Attribute
You can specify an attribute to sort by with the ``by`` attribute. Elements will be sorted alphabetically by the values of this attribute. If an attribute is ``null``, then it's considered "lesser" than all defined attributes. If the value of this attribute changes on any of the sorted elements, the elements will be re-sorted.

```js preview-story
export const ByHref = () => html`
  <ds-sorter by="class">
    <p class="b">A. This paragraph will be second since its class is b.</p>
    <p class="c">B. This paragraph...you get the picture.</p>
    <p class="a">C. This paragraph will actually be first since its class is a.</p>
  </ds-sorter>
`;
```

##### By Property
You can specify a property with the ``by`` attribute, too. To distinguish a property from an attribute, add a '.' before the property name e.g. ``.value``. Values that are ``undefined`` or ``null`` will be considered less than any defined value. Strings, numbers, and booleans will be sorted as expected. Array-like objects will be sorted by length. Functions will be sorted boolean style based on whether a function is present or not. Finally, all other objects will attempt to use their ``.valueOf()`` method, else they return ``undefined``. Note that, unlike attributes, changes to sorted property values won't automatically trigger a re-sort. When sorting by properties that you expect to change, it's recommended to listen for an event related to that value being changed, such as a change event on inputs, and manually call for a sort. An example further below demonstrates how you can do this. 
```js preview-story
export const ByValue = () => html`
  <ds-sorter by=".value">
    <input value="C" type="text"/>
    <input value="A" type="text"/>
    <input value="B" type="text"/>
  </ds-sorter>
`;
```

##### Sort Method
You can manually trigger a sort by calling the ``.sort()`` method on an instance of DsSorter. This is most useful when listening for events related to changes to properties that are being sorted by. Try changing the values in the text boxes below.
```js preview-story
export const SortMethod = () => html`
  <ds-sorter by=".value" onchange="this.sort()">
    <input value="C" type="text"/>
    <input value="A" type="text"/>
    <input value="B" type="text"/>
  </ds-sorter>
`;
``` 

##### Select Descendant
In many cases, the attribute or property you want to sort by isn't directly on a child element of the DsSorter element. In these cases, you can specify a CSS selector in curly braces before the name to query the sorted element's descendants with. Note, you can use ``:scope`` to refer to the sorted element, say if you want to specify that a descendant is a direct child.
```js preview-story
export const SelectDescendant = () => html`
  <ds-sorter by="{:scope > p > span} class">
    <div><p><span class="C">This is a span with class C inside a paragraph inside a div</span></p></div>
    <div><p><span class="A">This is a span with class A inside a paragraph inside a div</span></p></div>
    <div><p><span class="B">This is a span with class B inside a paragraph inside a div</span></p></div>
  </ds-sorter>
`;
``` 

##### Multiple Attributes and/or Properties
In scenarios where values might match, you might want to provide a fallback attribute or property to break the tie, per se. You can add more attributes or properties with commas in the ``by`` attributes. You can provide as many as you need, mixing attributes and properties with different selectors each. 
```js preview-story
export const MultipleBy = () => html`
  <ds-sorter by=".innerText, {a} href">
    <p><a href="#soThisWillComeSecond">Hey, these links match!</a></p>
    <p><a href="#awesome">This link will still come last even though the href would come first if we were sorting primarily by href.</a></p>
    <p><a href="#butNotTheHrefs">Hey, these links match!</a></p>
  </ds-sorter>
`;
``` 

##### Descending
If you want to reverse the order of the whole list, apply the ``descending`` attribute.
```js preview-story
export const Descending = () => html`
  <ds-sorter by="class, id" descending>
    <p class="b" id="3">Class B, ID 3</p>
    <p class="b" id="1">Class B, ID 1</p>
    <p class="c">Class C</p>
    <p class="a">Class A</p>
    <p class="b" id="2">Class B, ID 2</p>
  </ds-sorter>
`;
``` 

##### Reverse Order Values
When using multiple attributes and/or properties, you may want to reverse their sort relative to the rest of the list. For these attributes and properties, prepend a ">" before the name
```js preview-story
export const Reverse = () => html`
  <ds-sorter by="class, >id" descending>
    <p class="b" id="3">Class B, ID 3</p>
    <p class="b" id="1">Class B, ID 1</p>
    <p class="c">Class C</p>
    <p class="a">Class A</p>
    <p class="b" id="2">Class B, ID 2</p>
  </ds-sorter>
`;
``` 

### Advanced Options
While DsSorter is intended to be straightforward to use in vanilla HTML pages, it also offers some options for those who might use it alongside a JavaScript framework or with other Web Components.

##### By Nested Property
If the property you want to sort by is nested within another object on the element, you can specify it by adding a '.' and the property name immediately after the object property name e.g. ``.dataset.someData``. You can keep adding nested property names to go as deeply as you need to e.g. ``.someGrandparent.someParent.someChild.someData``
```js preview-story
export const ByDatasetValue = () => html`
  <ds-sorter by=".dataset.row">
    <div data-row="2">Row 2</div>
    <div data-row="1">Row 1</div>
    <div data-row="3">Row 3</div>
  </ds-sorter>
`;
```

##### Manually Specify Rules
Behind the scenes, the ``by`` attribute gets parsed into an array of ``Rule`` objects. If you find it easier, you may directly modify the ``rules`` attribute or property to update the sorting rules. Please note if setting the property you'll need to assign a new array for DsSorter to recognize a change. A Rule interface is provided if you're using TypeScript.
```js preview-story
export const RulesArray = () => html`
  <ul style="list-style: none; padding-inline-start: 0;">
    <ds-sorter .rules=${[{ selector: 'input', key: ['checked'] }, { key: ['dataset', 'added'], reverse: true }]} onchange="this.sort()">
      <li data-added="1"><label><input type="checkbox"/>Corn</label></li>
      <li data-added="2"><label><input type="checkbox"/>Milk</label></li>
      <li data-added="3"><label><input type="checkbox" checked/>Cheese</label></li>
      <li data-added="4"><label><input type="checkbox"/>Bread</label></li>
      <li data-added="5"><label><input type="checkbox" checked/>Nutmeg</label></li>
      <li data-added="6"><label><input type="checkbox"/>Apples</label></li>
    </ds-sorter>
  </ul>
`;
```

##### Custom Sorting
If none of the available configurations quite meet your needs (you may certainly submit a ticket or pull request for new features), you can provide a custom [comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) with the ``comparator`` property. Note that you'll have to get a reference to the DsSorter element and set the property. You can also still use the ``descending`` attribute to sort the elements in reverse order.

Click/tap the example to bind the custom sort function that sorts by the length of text in each paragraph. 
```js preview-story
export const Custom = () => html`
  <ds-sorter onclick="this.comparator = (a, b) => a.innerText.length - b.innerText.length">
    <p>A good amount of text</p>
    <p>A pretty decent amount of text</p>
    <p>Just a little text</p>
    <p>Some text</p>
    <p>An unnecessarily large amount of text for demonstration purposes.</p>
  </ds-sorter>
`;
``` 