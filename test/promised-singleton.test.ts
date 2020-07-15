import { html, fixture, expect } from '@open-wc/testing';

import {PromisedSingleton} from '../src/PromisedSingleton.js';
import '../promised-singleton.js';

describe('PromisedSingleton', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el: PromisedSingleton = await fixture(html`
      <promised-singleton></promised-singleton>
    `);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el: PromisedSingleton = await fixture(html`
      <promised-singleton></promised-singleton>
    `);
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el: PromisedSingleton = await fixture(html`
      <promised-singleton title="attribute title"></promised-singleton>
    `);

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el: PromisedSingleton = await fixture(html`
      <promised-singleton></promised-singleton>
    `);

    await expect(el).shadowDom.to.be.accessible();
  });
});
