import { html, LitElement, property } from 'lit-element';
// TODO: Allow setting descending per key? (> for descending?) 
// TODO: Todo list example
// TODO: Cast attributes? (+ number, ? boolean, : array)
export class DsSorter extends LitElement {

  /**
   * If present, sorts randomly. Optionally, assign a non-zero value to use as a seed.
   */
  @property({type: Number}) random = NaN

  /**
   * A list of values to sort by in order. By default, value is assumed to be an attribute. Changes to any listed attributes on any of the children will automatically cause a re-sort. 
   * To use a property, prepend "." to the name (e.g. ".checked"). Note that an automatic re-sort won't be triggered for property changes. In those scenarios, it's recommended to listen for events involved in the changing property (e.g. for checked, listen for change event)
   */
  @property({
    // TODO: would  this be beneficial? reflect: true,
    converter: {
      fromAttribute: value => value?.replace(' ', '').split(','),
      toAttribute: (value: string[]) => value.join(',')
    }
  }) by = ['.innerText']

  /**
   * Custom sort callback
   */
  @property({attribute: false}) custom: undefined | ((a: HTMLElement, b: HTMLElement) => number) = undefined

  /**
   * Sort in descending order (else ascending is default)
   */
  @property({type: Boolean}) descending = false

  /**
   * Optionally provide a selector with which to grab a descendent of the element being sorted to use the prop/attr/elem of (e.g. ul>ds-sort>li>a>span ':scope > a > span')
   */
  @property({type: String}) selector = ''

  get sortingAttributes() {
    return this.by.filter(item => item[0] !== '.')
  }

  private get _slottedContent() {
    return Array.from(this.shadowRoot?.querySelector('slot')?.assignedElements() ?? []) as HTMLElement[]
  }

  // TODO: Need to create new one when byAttribute changes?
  mutationObserver = new MutationObserver(mutationList => {
    console.log(mutationList)
    const shouldUpdate = mutationList.some(mutation => mutation.type === 'attributes' && this.sortingAttributes.length)
    if (shouldUpdate) this.sort()
  })

  disconnectedCallback() {
    super.disconnectedCallback()
    this.mutationObserver.disconnect()
  }

  updated() {
      this.sort()
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

  #sorter = (a: HTMLElement, b: HTMLElement, order: string[] = this.by): number => {
    // TODO: Optionally add a seed?
    if (!isNaN(this.random)) {
      return Math.random() - 0.5
    }

    if (this.custom) {
      return this.custom(a, b)
    }

    const [key, ...restKeys] = order

    const firstElem = (this.selector ? a.querySelector(this.selector) : a) as HTMLElement
    const secondElem = (this.selector ? b.querySelector(this.selector) : b) as HTMLElement

    this.mutationObserver.observe(firstElem, { attributes: true, attributeFilter: this.sortingAttributes })

    const firstVal = this.#getValue(firstElem, key)
    const secondVal = this.#getValue(secondElem, key)

    // TODO: Make more efficient. Shouldn't make each recursive call requery (check for restKeys, don't default param it?)
    if (firstVal === secondVal) { return restKeys.length && this.#sorter(a, b, restKeys) }
    if (firstVal < secondVal) { return this.descending ? 1 : -1 }
    return this.descending ? -1 : 1
  }

  /** Normalize value for comparison */
  #getValue = (elem: HTMLElement, key: string) => {
    // Attributes are always strings
    if (key[0] !== '.') return elem.getAttribute(key) ?? ''
    const propKey = key.substr(1) as keyof HTMLElement
    const prop = elem[propKey]
    // No nice way to sort by functions, just return that it exists
    if (typeof prop === 'function') return true
    // If array-like, return the length, else get the valueOf value (which for strings, numbers, and booleans should just return as is, objects should use the method if it's implemented, else it just gives up)
    return (prop as ArrayLike<unknown>)?.length ?? prop?.valueOf?.() ?? false
  }
}
