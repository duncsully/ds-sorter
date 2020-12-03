import { html, LitElement, property } from 'lit-element';

export class DsSorter extends LitElement {

  @property({type: String}) sortBy = ''

  @property({type: String}) sortingAttribute = ''

  slottedContent: Element[] = []

  get orderMethod() {
    if (this.sortBy === 'random') {
      return this.orderRandomly
    } else if (this.sortBy === 'attribute') {
      return this.orderByAttribute
    }
  }

  firstUpdated() {
    this.slottedContent = Array.from(this.shadowRoot?.querySelector('slot')?.assignedElements() ?? [])
  }

  updated() {
      this.slottedContent.sort(this.orderMethod)
        .forEach(el => el.parentElement?.appendChild(el))
  }

  render() {
    return html`
      <slot></slot>
    `;
  }

  // TODO: Optionally add a seed, need to implement own random num generator
  private orderRandomly() {
    return Math.random() - 0.5
  }

  // TODO: Optionally accept a selector for the element to grab the attribute from
  private orderByAttribute = (a: Element, b: Element) => {
    const first = a.getAttribute(this.sortingAttribute) ?? 0
    const second = b.getAttribute(this.sortingAttribute) ?? 0
    
    if (first === second) { return 0 }
    if (first < second) { return -1 }
    else { return 1 }
  }

  private orderByProperty = () => {
    
  }
}
