import { html, LitElement, property } from 'lit-element';
// TODO: Todo list example
// TODO: Implement PRNG with optional seed?
// TODO: Handle comparing different types? 
// TODO: Throw warning if selector returns null?
// TODO: Throw warning if nestedProps return undefined

export interface Rule {
  /** Attribute or property name */
  key: string;
  /** True if property, else attribute. Note: attributes will automatically trigger a re-sort if changed. Properties will not. */
  isProperty?: boolean;
  /** Selector for descendant to get attribute/property off of */
  selector?: string;
  /** If true, sort in reverse order relative to the global sort direction */
  reverse?: boolean;
  /** A path of properties to get the value from nested objects */
  nestedProps?: string[];
}

/**
 * Allows passing either a string of encoded rules or a stringified JSON array of Rule objects
 */
const parseToRules = (value: string | null): Rule[] => {
  if (!value) return [] 
  try {
    const parsed = JSON.parse(value!)
    // TODO: Validate schema?
    if (Array.isArray(parsed)) return parsed
  } catch (_) {
    // Fall through
  }
  if (typeof value === 'string') {
    const stringRules = value.split(/,\s*(?![^{}]*\})/)
    return stringRules.map(stringRule => {
      const [rawKey, selector] = stringRule.replace('{', '').split(/\}\s*/).reverse()
      let key = rawKey
      let reverse = false
      let isProperty = false
      let nestedProps: string[] = []
      if (key[0] === '>') {
        reverse = true
        key = key.slice(1)
      }
      if (key[0] === '.') {
        isProperty = true;
        [, key, ...nestedProps ] = key.split('.')
      }
      return {
        key,
        selector,
        reverse,
        isProperty,
        nestedProps
      }
    })
  }
  throw new Error(`${value} is not a string nor parsable JSON array`)
}

/**
 * A web component for sorting contained elements
 * 
 * @element ds-sorter
 * 
 * @slot - Content to sort
 * 
 * @attr {String} by - A list of comma-separated rules to sort by in order of precedence. <br/>Specify attributes by name (e.g. "href"). If specifying a property, prepend with "." (e.g. ".innerText"). <br/>Optionally, if you'd like to reverse a rule relative to the others, prepend a ">" (e.g. "href, >.innerText"). <br/>Finally, if you'd like to get a value of a descendant of the sorted element, wrap a selector in braces before the value and modifiers (e.g. {div label input} .checked).
 */
export class DsSorter extends LitElement {

  /**
   * If present, sorts randomly
   */
  @property({type: Boolean}) random = false

  /**
   * A list of rules to sort the elements by. Refer to Rule interface for properties.
   */
  @property({converter:  parseToRules}) by: Rule[] = [{ key: 'innerText', isProperty: true }]

  /**
   * Custom [comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) for sorting
   */
  @property({attribute: false}) comparator: undefined | ((a: HTMLElement, b: HTMLElement) => number) = undefined

  /**
   * Sort in descending order (else ascending is default)
   */
  @property({type: Boolean}) descending = false

  private get _slottedContent() {
    return Array.from(this.shadowRoot?.querySelector('slot')?.assignedElements() ?? []) as HTMLElement[]
  }

  private _mutationObserver = new MutationObserver(mutationList => {
    const shouldUpdate = mutationList.some(mutation => mutation.type === 'attributes')
    if (shouldUpdate) this.sort()
  })

  private _elementAttrsMap = new WeakMap<HTMLElement, Set<string>>()

  disconnectedCallback() {
    super.disconnectedCallback()
    this._mutationObserver.disconnect()
  }

  updated() {
      this.sort()
      this._slottedContent.forEach(elem => {
        this.by.forEach(rule => {
          const { key, selector, isProperty } = rule
          if (!isProperty) {
            const observeElem = (selector ? elem.querySelector(selector) : elem) as HTMLElement
            const attributeSet = this._elementAttrsMap.get(observeElem) ?? new Set()
            attributeSet.add(key)
            this._elementAttrsMap.set(observeElem, attributeSet)
            this._mutationObserver.observe(observeElem, { attributeFilter: Array.from(attributeSet) })
          }
        })
      })
  }

  render() {
    return html`
      <slot @slotchange=${this.sort}></slot>
    `;
  }

  /**
   * @method
   * Manually trigger a sort, such as in response to an event e.g. <ds-sorter onchange="this.sort()">...</ds-sort>
   */
  sort(): void {
    this._slottedContent.sort(this.#compareElements)
      .forEach((el, i) => (el.parentElement?.children[i] !== el) && el.parentElement?.appendChild(el))
  }

  #compareElements = (a: HTMLElement, b: HTMLElement, rules = this.by): number => {
    if (this.random) {
      return Math.random() - 0.5
    }

    if (this.comparator) {
      return this.comparator(a, b) * (this.descending ? -1 : 1)
    }

    const [rule, ...restRules] = rules
    const { reverse = false } = rule

    const firstVal = this.#getValue(a, rule)
    const secondVal = this.#getValue(b, rule)

    const invertValue = this.descending != reverse
    const [lesser, greater] = invertValue ? [1, -1] : [-1, 1]

    if ((firstVal == undefined && secondVal == undefined) || firstVal === secondVal) {
      // If current values are equal, move down the keys until something isn't equal or we run out of keys
      return restRules.length && this.#compareElements(a, b, restRules)
    }
    // defined falsy value is greater than undefined
    if (firstVal == undefined && secondVal != undefined) {
      return lesser
    }
    if (firstVal != undefined && secondVal == undefined) {
      return greater
    }
    
    if (firstVal! < secondVal!) {
      return lesser
    }
    return greater
  }

  /** Normalize value for comparison */
  #getValue = (sortingElem: HTMLElement, rule: Rule) => {
    const { key, isProperty, nestedProps = [], selector } = rule
    const elem = (selector ? sortingElem.querySelector(selector) : sortingElem) as HTMLElement
    // Attributes are always strings
    if (!isProperty) return elem.getAttribute(key)

    let prop = elem[key as keyof HTMLElement]
    for (const nestedProp of nestedProps) {
      if (typeof prop !== 'object') break
      prop = prop?.[nestedProp as keyof typeof prop]
    }
    
    const returnAsIs: typeof prop[]  = ['number', 'string', 'boolean', 'bigint', 'undefined']
    const typeofProp = typeof prop
    
    if (returnAsIs.includes(typeofProp)) {
      return prop
    }
    if (typeofProp === 'function') {
      // No good way to sort functions, just return that it exists
      return true
    }
    if (typeofProp === 'object') {
      // If array-like, return the length, else get the valueOf value (which for strings, numbers, and booleans should just return as is, objects should use the method if it's implemented)
      return (prop as ArrayLike<unknown>)?.length ?? prop?.valueOf?.()
    }
    return undefined
  }
}
