import { fixture, expect } from '@open-wc/testing'
import { html } from 'lit-html'
import Sinon from 'sinon'
import '../ds-sorter.js';
import { DsSorter } from '../index.js';

const getSortedPromise = (el: Element) => new Promise(res => {
  const handler = () => {
    el.removeEventListener('ds-sort', handler)
    res(undefined)
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

  describe('random', () => {
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

  describe('by', () => {
      it('parses to empty rules if empty', async () => {
        const el = await fixture(html`<ds-sorter by=''></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([])
      })

      it('parses to rule with attribute key if simple string', async () => {
        const el = await fixture(html`<ds-sorter by='class'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: 'class', reverse: false, selector: undefined}])
      })

      it('parses to rule with reverse set to true if first char is >', async () => {
        const el = await fixture(html`<ds-sorter by='>class'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: 'class', reverse: true, selector: undefined}])
      })

      it('parses to rule with array key if . before key name', async () => {
        const el = await fixture(html`<ds-sorter by='.checked'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: ['checked'], reverse: false, selector: undefined}])
      })

      it('parses to rule with array key of multiple values if multiple . in key name', async () => {
        const el = await fixture(html`<ds-sorter by='.dataset.whatever'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: ['dataset', 'whatever'], reverse: false, selector: undefined}])
      })

      it('parses to rule with default of ["innerText"] if no key provided', async () => {
        const el = await fixture(html`<ds-sorter by='>'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: ['innerText'], reverse: true, selector: undefined}])
      })

      it('parses to rule with selector of what is between brackets', async () => {
        const el = await fixture(html`<ds-sorter by='{:scope > p} class'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: 'class', reverse: false, selector: ':scope > p'}])
      })

      it('parses to rules with multiple sections separated by comma', async () => {
        const el = await fixture(html`<ds-sorter by='{:scope > p} class, >.innerText'></ds-sorter>`) as DsSorter
        expect(el.rules).to.deep.equal([{key: 'class', reverse: false, selector: ':scope > p'}, {key: ['innerText'], reverse: true, selector: undefined}])
      })

      it('returns compiled value of current rules prop', async () => {
        const el = await fixture(html`<ds-sorter .rules=${[{key: 'class', selector: ':scope > p'}, {selector: 'div', key: ['innerText'], reverse: true}]}></ds-sorter>`) as DsSorter
        expect(el.by).to.equal('{:scope > p} class, {div} >.innerText')
      })
  })

  describe('rules', () => {
    it('accepts a stringified Rules array for the attribute', async () => {
      const el = await fixture(html`<ds-sorter rules='[{"key": ["id", "something", "somethingElse"], "selector": "p > a", "reverse": true}]'></ds-sorter>`) as DsSorter
      expect(el.rules).to.deep.equal([{ key: ["id", "something", "somethingElse"], selector: "p > a", reverse: true }])
    })

    it('does nothing if empty', async () => {
      const el = await fixture(html`<ds-sorter .rules=${[]}>
        <div>c</div>
        <div>a</div>
        <div>d</div>
        <div>b</div>
      </ds-sorter>`);
      (['c', 'a', 'd', 'b'].forEach((letter, i) => {
        expect((el.children[i] as HTMLElement).innerText).to.equal(letter)
      }))
    })

    it('can sort by single attributes', async () => {
      const el = await fixture(html`<ds-sorter .rules=${[{key: 'class'}]}>
        <div class="b"></div>
        <div class="c"></div>
        <div class="a"></div>
      </ds-sorter>`);
      (['a', 'b', 'c'].forEach((letter, i) => {
        expect((el.children[i] as HTMLElement).getAttribute('class')).to.equal(letter)
      }))
    })

    it('will automatically re-sort when attribute changes', async () => {
      const el = await fixture(html`<ds-sorter .rules=${[{key: 'class'}]}>
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
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['value']}]}>
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
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
        <input .test=${3} />
        <input .test=${1} />
        <input .test=${2} />
      </ds-sorter>`);
      ([1, 2, 3].forEach((num, i) => {
        expect((el.children[i] as TestElement).test).to.equal(num)
      }))
    })

    it('can sort by nested property values', async () => {
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['dataset', 'arbitrary']}]}>
        <input data-arbitrary="c" />
        <input data-arbitrary="a" />
        <input data-arbitrary="b" />
      </ds-sorter>`);
      (['a', 'b', 'c'].forEach((letter, i) => {
        expect((el.children[i] as HTMLInputElement).dataset['arbitrary']).to.equal(letter)
      }))
    })

    it('can sort by array length', async () => {
      interface TestElement extends HTMLElement { test: number[] }
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
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
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
        <input .test=${new Date(2)} />
        <input .test=${new Date(3)} />
        <input .test=${new Date(1)} />
      </ds-sorter>`);
      ([1, 2, 3].forEach((num, i) => {
        expect((el.children[i] as TestElement).test.valueOf()).to.equal(num)
      }))
    })

    it('can sort by whether function is present or not', async () => {
      interface TestElement extends HTMLElement { test: () => number }
      const testFunc = () => 1
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
        <input .test=${null} />
        <input .test=${testFunc} />
        <input .test=${null} />
      </ds-sorter>`);
      expect((el.children[2] as TestElement).test).to.equal(testFunc)
    })

    it('can sort by symbol values by using their descriptions', async () => {
      const sym1 = Symbol('a')
      const sym2 = Symbol('b')
      const sym3 = Symbol('c')
      interface TestElement extends HTMLElement { test: symbol }
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
        <input .test=${sym3} />
        <input .test=${sym2} />
        <input .test=${sym1} />
      </ds-sorter>`);
      (['a', 'b', 'c'].forEach((letter, i) => {
        expect((el.children[i] as TestElement).test.description).to.equal(letter)
      }))
    })

    it('considers null and undefined as less than falsy values', async () => {
      interface TestElement extends HTMLElement { test: undefined | null | number }
      const el = await fixture(html`<ds-sorter .rules=${[{key: ['test']}]}>
        <input .test=${0} />
        <input .test=${undefined} />
        <input .test=${null} />
      </ds-sorter>`)
      expect((el.children[2] as TestElement).test).to.equal(0)
    })

    it('allows specifying a selector to use instead of top-most elements', async () => {
      const el = await fixture(html`<ds-sorter .rules=${[{selector: ':scope > p > b', key: 'class'}]}>
        <div>1<p>1<b class='c'></b></p></div>
        <div>2<p>2<b class='a'></b></p></div>
        <div>3<p>3<b class='b'></b></p></div>
      </ds-sorter>`);
      (['a', 'b', 'c'].forEach((letter, i) => {
        expect(el.children[i].children[0].children[0].getAttribute('class')).to.equal(letter)
      }))
    })

    it('will resort when changing the sorted attribute when using a selector', async () => {
      interface TestElement extends HTMLElement { test: undefined | null | string }
      const el = await fixture(html`<ds-sorter .rules=${[{selector: ':scope b', key: 'test'}]}>
        <div>1<p>1<b test='c'></b></p></div>
        <div>2<p>2<b test='a'></b></p></div>
        <div>3<p>3<b test='b'></b></p></div>
      </ds-sorter>`);
      const sorted = getSortedPromise(el);
      (el.children[0].children[0].children[0] as TestElement).setAttribute('test', 'd')
      await sorted;
      (['b', 'c', 'd'].forEach((letter, i) => {
        expect((el.children[i].children[0].children[0] as TestElement).getAttribute('test')).to.equal(letter)
      }))
    })

    it('can sort by multiple attrs and/or props', async () => {
      interface TestElement extends HTMLElement { test: undefined | null | number }
      const el = await fixture(html`<ds-sorter .rules=${[{selector: 'p', key: ['test']}, {key: 'class'}]}>
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
      const el = await fixture(html`<ds-sorter .rules=${[{selector: 'p', key: ['test']}, {key: 'class', reverse: true}]}>
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
  })

  describe('descending', () => {
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

  describe('comparator', () => {
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

  describe('console warnings', () => {
    beforeEach(() => Sinon.spy(console, 'warn'))
    afterEach(() => Sinon.restore())

    it('should warn when no element returned from selector query', async () => {
      await fixture(html`
        <ds-sorter by="{a}">
          <p>What</p>
          <p>Who</p>
        </ds-sorter>
      `)
      expect(console.warn).to.have.been.called
    })

    it('should warn when property does not exist on DOM element', async () => {
      await fixture(html`
        <ds-sorter by=".thisDoesNotExist">
          <p>What</p>
          <p>Who</p>
        </ds-sorter>
      `)
      expect(console.warn).to.have.been.called
    })

    it('should warn when attempting to access nested property on value that is not an object', async () => {
      await fixture(html`
        <ds-sorter by=".id.isNotObject">
          <p>What</p>
          <p>Who</p>
        </ds-sorter>
      `)
      expect(console.warn).to.have.been.called
    })

    it('should warn when attempting to access nested property that does not exist on object value', async () => {
      await fixture(html`
        <ds-sorter by=".dataset.thisDoesNotExist">
          <p>What</p>
          <p>Who</p>
        </ds-sorter>
      `)
      expect(console.warn).to.have.been.called
    })
  })
})