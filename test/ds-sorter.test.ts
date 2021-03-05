import { html, fixture, expect } from '@open-wc/testing';
import '../ds-sorter.js';

/* TODO: Tests
 * Parsing JSON rules
 * Directly setting by prop rules
 * Warnings
 */
const getSortedPromise = (el: Element) => new Promise(res => {
  const handler = () => {
    el.removeEventListener('ds-sort', handler)
    res()
  }
  el.addEventListener('ds-sort', handler)
})

describe('DsSorter', () => {
  it('sorts by .innertText by default', async () => {
    const el = await fixture(html`<ds-sorter>
        <div>c</div>
        <div>a</div>
        <div>d</div>
        <div>b</div>
    </ds-sorter>`);
    (['a', 'b', 'c', 'd'].forEach((letter, i) => {
        expect((el.children[i] as HTMLElement).innerText).to.equal(letter)
    }))
  })

  it('re-sorts when adding elements to slot', async () => {
    const el = await fixture(html`<ds-sorter>
        <div>c</div>
        <div>a</div>
        <div>d</div>
    </ds-sorter>`);
    const newItem = await fixture(html`<div>b</div>`)
    const sorted = getSortedPromise(el)
    el.appendChild(newItem)
    await sorted;
    (['a', 'b', 'c', 'd'].forEach((letter, i) => {
      expect((el.children[i] as HTMLElement).innerText).to.equal(letter)
  }))
  })

  describe('attribute: random', () => {
    // Not the most scientific test but...just making sure that "b" and "c" each get a chance at being first. 
    it('sorts randomly', async () => {
        const letterCount: Record<string, number> = {
            a: 0,
            b: 0,
            c: 0
        }
        for (let i = 0; i < 100; i++) {
            const el = await fixture(html`<ds-sorter random>
                <div>a</div>
                <div>b</div>
                <div>c</div>
            </ds-sorter>`);
            letterCount[(el.children[0] as HTMLElement).innerText] += 1
        }
        expect(letterCount.b).to.be.above(0)
        expect(letterCount.c).to.be.above(0)
    })
  })

  describe('attribute: by', () => {
      it('can sort by single attributes', async () => {
        const el = await fixture(html`<ds-sorter by="class">
          <div class="b"></div>
          <div class="c"></div>
          <div class="a"></div>
        </ds-sorter>`);
        (['a', 'b', 'c'].forEach((letter, i) => {
          expect((el.children[i] as HTMLElement).getAttribute('class')).to.equal(letter)
        }))
      })

      it('will automatically re-sort when attribute changes', async () => {
        const el = await fixture(html`<ds-sorter by="class">
          <div class="b"></div>
          <div class="c"></div>
          <div class="a"></div>
        </ds-sorter>`)
        const sorted = getSortedPromise(el)
        el.children[0].setAttribute('class', 'd')
        await sorted;
        (['b', 'c', 'd'].forEach((letter, i) => {
          expect((el.children[i] as HTMLElement).getAttribute('class')).to.equal(letter)
        }))
      })

      it('can sort by properties with string values', async () => {
        const el = await fixture(html`<ds-sorter by=".value">
          <input .value=${"c"} />
          <input .value=${"a"} />
          <input .value=${"b"} />
        </ds-sorter>`);
        (['a', 'b', 'c'].forEach((letter, i) => {
          expect((el.children[i] as HTMLInputElement).value).to.equal(letter)
        }))
      })

      it('can sort by properties with number values', async () => {
        interface TestElement extends HTMLElement { test: number } 
        const el = await fixture(html`<ds-sorter by=".test">
          <input .test=${3} />
          <input .test=${1} />
          <input .test=${2} />
        </ds-sorter>`);
        ([1, 2, 3].forEach((num, i) => {
          expect((el.children[i] as TestElement).test).to.equal(num)
        }))
      })

      it('can sort by array length', async () => {
        interface TestElement extends HTMLElement { test: number[] }
        const el = await fixture(html`<ds-sorter by='.test'>
          <input .test=${[2]} />
          <input .test=${[1, 2, 3]} />
          <input .test=${[3, 1]} />
        </ds-sorter>`)
        expect((el.children[0] as TestElement).test).to.deep.equal([2])
        expect((el.children[1] as TestElement).test).to.deep.equal([3, 1])
        expect((el.children[2] as TestElement).test).to.deep.equal([1, 2, 3])
      })

      it('can sort by objects with valueof', async () => {
        interface TestElement extends HTMLElement { test: Date }
        const el = await fixture(html`<ds-sorter by='.test'>
          <input .test=${new Date(2)} />
          <input .test=${new Date(3)} />
          <input .test=${new Date(1)} />
        </ds-sorter>`);
        ([1, 2, 3].forEach((num, i) => {
          expect((el.children[i] as TestElement).test.valueOf()).to.equal(num)
        }))
      })

      it('considers null and undefined as less than falsy values', async () => {
        interface TestElement extends HTMLElement { test: undefined | null | number }
        const el = await fixture(html`<ds-sorter by='.test'>
          <input .test=${0} />
          <input .test=${undefined} />
          <input .test=${null} />
        </ds-sorter>`)
        expect((el.children[2] as TestElement).test).to.equal(0)
      })

      it('allows specifying a selector to use instead of top-most elements', async () => {
        interface TestElement extends HTMLElement { test: undefined | null | number }
        const el = await fixture(html`<ds-sorter by='{:scope>p>b}.test'>
          <div>1<p>1<b .test=${3}></b></p></div>
          <div>2<p>2<b .test=${1}></b></p></div>
          <div>3<p>3<b .test=${2}></b></p></div>
        </ds-sorter>`);
        ([1, 2, 3].forEach((num, i) => {
          expect((el.children[i].children[0].children[0] as TestElement).test).to.equal(num)
        }))
      })

      it('can sort by multiple attrs and/or props', async () => {
        interface TestElement extends HTMLElement { test: undefined | null | number }
        const el = await fixture(html`<ds-sorter by='{:scope>p}.test, class'>
          <div class='b'><p .test=${2}></p></div>
          <div class='a'><p .test=${2}></p></div>
          <div class='a'><p .test=${1}></p></div>
          <div class='b'><p .test=${1}></p></div>
        </ds-sorter>`);
        expect((el.children[0].children[0] as TestElement).test).to.equal(1)
        expect((el.children[0] as HTMLElement).getAttribute('class')).to.equal('a')
        expect((el.children[1].children[0] as TestElement).test).to.equal(1)
        expect((el.children[1] as HTMLElement).getAttribute('class')).to.equal('b')
        expect((el.children[2].children[0] as TestElement).test).to.equal(2)
        expect((el.children[2] as HTMLElement).getAttribute('class')).to.equal('a')
        expect((el.children[3].children[0] as TestElement).test).to.equal(2)
        expect((el.children[3] as HTMLElement).getAttribute('class')).to.equal('b')
      })

      it('can reverse individual attrs/props', async () => {
        interface TestElement extends HTMLElement { test: undefined | null | number }
        const el = await fixture(html`<ds-sorter by='{:scope>p}.test, >class'>
          <div class='b'><p .test=${2}></p></div>
          <div class='a'><p .test=${2}></p></div>
          <div class='a'><p .test=${1}></p></div>
          <div class='b'><p .test=${1}></p></div>
        </ds-sorter>`);
        expect((el.children[0].children[0] as TestElement).test).to.equal(1)
        expect((el.children[0] as HTMLElement).getAttribute('class')).to.equal('b')
        expect((el.children[1].children[0] as TestElement).test).to.equal(1)
        expect((el.children[1] as HTMLElement).getAttribute('class')).to.equal('a')
        expect((el.children[2].children[0] as TestElement).test).to.equal(2)
        expect((el.children[2] as HTMLElement).getAttribute('class')).to.equal('b')
        expect((el.children[3].children[0] as TestElement).test).to.equal(2)
        expect((el.children[3] as HTMLElement).getAttribute('class')).to.equal('a')
      })

      it('defaults to .innerText if no key provided', async () => {
        const el = await fixture(html`<ds-sorter by='{p}>'>
          <div>1<p>2</p></div>
          <div>2<p>3</p></div>
          <div>3<p>1</p></div>
        </ds-sorter>`);
        (['3', '2', '1'].forEach((num, i) => {
          expect((el.children[i].children[0] as HTMLElement).innerText).to.equal(num)
        }))
      })
  })

  describe('attribute: descending', () => {
    it('reverses the sort order', async () => {
      interface TestElement extends HTMLElement { test: undefined | null | number }
      const el = await fixture(html`<ds-sorter descending by='{:scope>p}.test, >class'>
        <div class='b'><p .test=${2}></p></div>
        <div class='a'><p .test=${2}></p></div>
        <div class='a'><p .test=${1}></p></div>
        <div class='b'><p .test=${1}></p></div>
      </ds-sorter>`);
      expect((el.children[0].children[0] as TestElement).test).to.equal(2)
      expect((el.children[0] as HTMLElement).getAttribute('class')).to.equal('a')
      expect((el.children[1].children[0] as TestElement).test).to.equal(2)
      expect((el.children[1] as HTMLElement).getAttribute('class')).to.equal('b')
      expect((el.children[2].children[0] as TestElement).test).to.equal(1)
      expect((el.children[2] as HTMLElement).getAttribute('class')).to.equal('a')
      expect((el.children[3].children[0] as TestElement).test).to.equal(1)
      expect((el.children[3] as HTMLElement).getAttribute('class')).to.equal('b')
    })
  })

  describe('property: comparator', () => {
    it('specifies an arbitrary comparator function to sort by', async () => {
      const comparator = (a: HTMLElement, b: HTMLElement) => a.innerText.length - b.innerText.length
      const el = await fixture(html`<ds-sorter .comparator=${comparator}>
        <p>Medium</p>
        <p>Lengthy</p>
        <p>Short</p>
      </ds-sorter>`)
      expect((el.children[0] as HTMLElement).innerText).to.equal('Short')
      expect((el.children[1] as HTMLElement).innerText).to.equal('Medium')
      expect((el.children[2] as HTMLElement).innerText).to.equal('Lengthy')
    })

    it('still sorts by descending if set', async () => {
      const comparator = (a: HTMLElement, b: HTMLElement) => a.innerText.length - b.innerText.length
      const el = await fixture(html`<ds-sorter .comparator=${comparator} descending>
        <p>Medium</p>
        <p>Lengthy</p>
        <p>Short</p>
      </ds-sorter>`)
      expect((el.children[0] as HTMLElement).innerText).to.equal('Lengthy')
      expect((el.children[1] as HTMLElement).innerText).to.equal('Medium')
      expect((el.children[2] as HTMLElement).innerText).to.equal('Short')
    })
  })
})