import { html, fixture, expect } from '@open-wc/testing';

import {DsOrderer} from '../src/DsOrderer.js';
import '../ds-orderer.js';

describe('DsOrderer', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el: DsOrderer = await fixture(html`
      <ds-orderer></ds-orderer>
    `);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el: DsOrderer = await fixture(html`
      <ds-orderer></ds-orderer>
    `);
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el: DsOrderer = await fixture(html`
      <ds-orderer title="attribute title"></ds-orderer>
    `);

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el: DsOrderer = await fixture(html`
      <ds-orderer></ds-orderer>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
