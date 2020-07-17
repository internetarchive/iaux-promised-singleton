import { expect } from '@open-wc/testing';

import { PromisedSingleton } from '../src/promised-singleton';

describe('Promised Singleton', () => {
  it('can execute the promised result', async () => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: new Promise(resolve => {
        resolve('foo');
      }),
    });

    const result = await promisedSingleton.get();
    expect(result).to.equal('foo');
  });

  it('only executes the promised result once', async () => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: new Promise(resolve => {
        const random = Math.random();
        resolve(`foo-${random}`);
      }),
    });

    const result = await promisedSingleton.get();
    const result2 = await promisedSingleton.get();
    expect(result).to.equal(result2);
  });

  it('resolves many concurrent requests for the singlton', async () => {
    const count = 5;
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: new Promise(resolve => {
        const random = Math.random();
        resolve(`foo-${random}`);
      }),
    });

    const promises: Promise<string>[] = [];
    for (let index = 0; index < count; index++) {
      const promise = promisedSingleton.get();
      promises.push(promise);
    }

    const results: string[] = await Promise.all(promises);

    const firstResult = results[0];
    for (let index = 0; index < count; index++) {
      expect(results[index]).to.equal(firstResult);
    }
  });

  // This test queues up 3 promises that get rejected and verifies that the same
  // error message gets received by all three requests. This indicates they are
  // all receiving the same rejection
  it('rejects concurrent requests for the singleton', (done) => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: new Promise((resolve, reject) => {
        setTimeout(() => {
          const random = Math.random();
          reject(`ohno-${random}`);
        }, 25);
      }),
    });

    let firstError = '-';
    promisedSingleton
      .get()
      .then(() => { expect.fail('should not get here'); })
      .catch(error => {
        firstError = error;
    });

    let secondError = '.';
    promisedSingleton
      .get()
      .then(() => { expect.fail('should not get here'); })
      .catch(error => {
        secondError = error;
      });

    promisedSingleton
      .get()
      .then(() => { expect.fail('should not get here'); })
      .catch(error => {
        expect(error).to.equal(firstError);
        expect(error).to.equal(secondError);
        done()
      });
  });
});
