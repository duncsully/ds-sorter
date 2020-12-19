```js script
import { html, withKnobs, withWebComponentsKnobs, text, array, boolean } from '@open-wc/demoing-storybook';
import '../dist/ds-sorter.js';

export default {
  title: 'DsSorter',
  component: 'ds-sorter',
  options: { selectedPanel: "storybookjs/knobs/panel" },
  decorators: [withKnobs, /* withWebComponentsKnobs */],
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

```html
<script src=""></script>
```

## API
<sb-props of="ds-sorter"></sb-props>

## Playground
```js preview-story
export const Playground = ({ random, by, selector, reverse, comparator, descending}) => html`
  <ds-sorter ?random=${boolean('random', true)} by=${text('by', 'class')} selector=${text('selector', '')} reverse=${text('reverse', '')} .comparator=${comparator} ?descending=${boolean('descending', false)}>
    <div class="B"><p class="A"><span class="C">div B, p A, span C</span></p></div>
    <div class="C"><p class="B"><span class="A">div C, p B, span A</span></p></div>
    <div class="A"><p class="C"><span class="B">div A, p C, span B</span></p></div>
  </ds-sorter>
`
```

## Examples

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
You can specify a property with the ``by`` attribute, too. To distinguish a property from an attribute, add a '.' before the property name e.g. ``.value``. ``Undefined`` or ``null`` values will be considered less than any defined value. Strings, numbers, and booleans will be sorted as expected. Array-like objects will be sorted by length. Functions will be sorted boolean style based on whether a function is present or not. Finally, all other objects will attempt to use their ``.valueOf()`` method, else they return ``undefined``. Note that, unlike attributes, changes to sorted property values won't automatically trigger a re-sort. When sorting by properties that you expect to change, it's recommended to listen for an event related to that value being changed, such as a change event on inputs. The next example demonstrates how you can do this. 
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
In many cases, the attribute or property you want to sort by isn't directly on a child element of the DsSorter element. In these cases, you can use the ``selector`` attribute to specify a CSS selector to use off of each top-level element to grab one of its descendants. Note, you can use ``:scope`` to refer to the top-level element, say if you want to specify that a descendant is a direct child.
```js preview-story
export const SelectDescendant = () => html`
  <ds-sorter by="class" selector=":scope > p > span">
    <div><p><span class="C">This is a span with class C inside a paragraph inside a div</span></p></div>
    <div><p><span class="A">This is a span with class A inside a paragraph inside a div</span></p></div>
    <div><p><span class="B">This is a span with class B inside a paragraph inside a div</span></p></div>
  </ds-sorter>
`;
``` 

##### Multiple Attributes and/or Properties
In scenarios where values might match, you might want to provide a fallback attribute or property to break the tie, per se. You can add more attributes or properties with commas in the ``by`` attributes. You can provide as many as you need, mixing attributes and properties. 
```js preview-story
export const MultipleBy = () => html`
  <ds-sorter by=".innerText, href" selector="a">
    <p><a href="#soThisWillComeSecond">Hey, these links match!</a></p>
    <p><a href="#awesome">This link will still come last even though the href would come first if we were sorting primarily by href.</a></p>
    <p><a href="#butNotTheHrefs">Hey, these links match!</a></p>
  </ds-sorter>
`;
``` 

##### Reverse Order Values
When using multiple attributes and/or properties, you may want certain ones to be sorted in descending order for their values instead of ascending order (and vice verse). For these attributes and properties, list them in the ``reverse`` attribute separated by commas.
```js preview-story
export const Reverse = () => html`
  <ds-sorter by="class, id" reverse="id">
    <p class="b" id="3">Class B, ID 3</p>
    <p class="b" id="1">Class B, ID 1</p>
    <p class="c">Class C</p>
    <p class="a">Class A</p>
    <p class="b" id="2">Class B, ID 2</p>
  </ds-sorter>
`;
``` 

##### Descending
If you want to reverse the order of the whole list, apply the ``descending`` attribute.
```js preview-story
export const Descending = () => html`
  <ds-sorter by="class, id" reverse="id" descending>
    <p class="b" id="3">Class B, ID 3</p>
    <p class="b" id="1">Class B, ID 1</p>
    <p class="c">Class C</p>
    <p class="a">Class A</p>
    <p class="b" id="2">Class B, ID 2</p>
  </ds-sorter>
`;
``` 

##### Custom Sorting
Finally, if none of the available configurations quite meet your needs (you may certainly submit a ticket or pull request for new features), you can provide a custom [comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) with the ``comparator`` property. Note that you'll have to get a reference to the DsSorter element and set the property. If you use the ``selector`` attribute, then the comparison function will be passed the elements queried with the selector. You can also still use the ``descending`` attribute to sort the elements in reverse order.

Mouseover the example to bind the custom sort function that sorts by the length of text in each paragraph. 
```js preview-story
export const Custom = () => html`
  <ds-sorter onmouseover="this.comparator = (a, b) => a.innerText.length - b.innerText.length">
    <p>A good amount of text</p>
    <p>A pretty large amount of text</p>
    <p>Just a little text</p>
    <p>Some text</p>
    <p>An unnecessarily huge amount of text for demonstration purposes.</p>
  </ds-sorter>
`;
``` 