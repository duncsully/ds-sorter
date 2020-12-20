import { html, LitElement, property } from 'lit-element';
// TODO: Todo list example
// TODO: Cast attributes? (+ number, ? boolean, : array)
// TODO: Implement PRNG with optional seed?
// TODO: Handle comparing different types? 
// TODO: Allow selector per attr/prop in 'by'?
// TODO: Throw warning if selector returns null?
// TODO: by nested property? e.g. '.styles.color'

/**
 * Allows passing either a string of comma-separated values (e.g. "value1, value2, value3") for easier HTML usage or an array of strings for framework usage
 * @param value Either a string of comma-separated values or an array
 * 
 */
const stringToArray = (value: string | null) => {
  if (!value) { return [] }
  try {
    const parsed = JSON.parse(value!)
    if (Array.isArray(parsed)) return parsed
  } catch (_) {
    // Fall through
  }
  if (typeof value === 'string') {
    return value.split(/,\s*/)
  }
  throw new Error(`${value} is not a string or parsable JSON array`)
} 
/**
 * A web component for sorting contained elements
 * @element ds-sorter
 * 
 * @slot - Content to sort
 */
export class DsSorter extends LitElement {

  /**
   * If present, sorts randomly
   */
  @property({type: Boolean}) random = false

  /**
   * A list of keys to sort by in order. By default, key is assumed to be for an attribute. Changes to any listed attributes on any of the children will automatically cause a re-sort. 
   * To use a property, prepend "." to the key (e.g. ".checked"). Note that an automatic re-sort won't be triggered for property changes. In those scenarios, it's recommended to listen for events involved in the changing property (e.g. for checked, listen for change event)
   */
  @property({converter:  stringToArray}) by = ['.innerText']

  /**
   * Custom [comparison function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) for sorting
   */
  @property({attribute: false}) comparator: undefined | ((a: HTMLElement, b: HTMLElement) => number) = undefined

  /**
   * Sort in descending order (else ascending is default)
   */
  @property({type: Boolean}) descending = false

  /**
   * Any keys to reverse the order of relative to the rest
   */
  @property({converter: stringToArray}) reverse: string[] = []

  /**
   * Optionally provide a selector with which to grab a descendent of the element being sorted to use the prop/attr/elem of (e.g. ul>ds-sort>li>a>span ':scope > a > span')
   */
  @property({type: String}) selector = ''

  private get sortingAttributes() {
    return this.by.filter(item => item[0] !== '.')
  }

  private get _slottedContent() {
    return Array.from(this.shadowRoot?.querySelector('slot')?.assignedElements() ?? []) as HTMLElement[]
  }

  private _mutationObserver = new MutationObserver(mutationList => {
    const shouldUpdate = mutationList.some(mutation => mutation.type === 'attributes' && this.sortingAttributes.length)
    if (shouldUpdate) this.sort()
  })

  disconnectedCallback() {
    super.disconnectedCallback()
    this._mutationObserver.disconnect()
  }

  updated() {
      this.sort()
      this._slottedContent.forEach(elem => {
        const observeElem = (this.selector ? elem.querySelector(this.selector) : elem) as HTMLElement
        this._mutationObserver.observe(observeElem, { attributes: true, attributeFilter: this.sortingAttributes })
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
  sort = () => {
    this._slottedContent.sort(this.#sorter)
      .forEach((el, i) => (el.parentElement?.children[i] !== el) && el.parentElement?.appendChild(el))
  }

  #sorter = (a: HTMLElement, b: HTMLElement): number => {
    if (this.random) {
      return Math.random() - 0.5
    }

    const firstElem = (this.selector ? a.querySelector(this.selector) : a) as HTMLElement
    const secondElem = (this.selector ? b.querySelector(this.selector) : b) as HTMLElement

    return this.#compareElements(firstElem, secondElem)
  }

  #compareElements = (firstElem: HTMLElement, secondElem: HTMLElement, keys = this.by): number => {
    if (this.comparator) {
      return this.comparator(firstElem, secondElem) * (this.descending ? -1 : 1)
    }
    const [key, ...restKeys] = keys
    const firstVal = this.#getValue(firstElem, key)
    const secondVal = this.#getValue(secondElem, key)

    const invertValue = this.descending != this.reverse.includes(key)
    const [lesser, greater] = invertValue ? [1, -1] : [-1, 1]


    if ((firstVal == undefined && secondVal == undefined) || firstVal === secondVal) {
      // If current values are equal, move down the keys until something isn't equal or we run out of keys
      return restKeys.length && this.#compareElements(firstElem, secondElem, restKeys)
    }
    // defined falsey value is greater than undefined
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
  #getValue = (elem: HTMLElement, key: string) => {
    // Attributes are always strings
    if (key[0] !== '.') return elem.getAttribute(key)
    const propKey = key.substr(1) as keyof HTMLElement
    const prop = elem[propKey]
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
