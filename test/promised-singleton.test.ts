import { expect } from '@open-wc/testing';

import { PromisedSingleton } from '../src/promised-singleton';
import { promisedSleep } from './promised-sleep';

describe('Promised Singleton', () => {
  it('can execute the promised result', async () => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: (): Promise<string> =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve('foo');
          }, 25);
        }),
    });

    const result = await promisedSingleton.get();
    expect(result).to.equal('foo');
  });

  it('only executes the promised result once', async () => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: (): Promise<string> =>
        new Promise(resolve => {
          setTimeout(() => {
            const random = Math.random();
            resolve(`foo-${random}`);
          }, 25);
        }),
    });

    const result = await promisedSingleton.get();
    const result2 = await promisedSingleton.get();
    expect(result).to.equal(result2);
  });

  it('resolves many concurrent requests for the singleton', async () => {
    const count = 5;
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: (): Promise<string> =>
        new Promise(resolve => {
          setTimeout(() => {
            const random = Math.random();
            resolve(`foo-${random}`);
          }, 25);
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
  it('rejects concurrent requests for the singleton', done => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: (): Promise<string> =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            const random = Math.random();
            reject(`ohno-${random}`);
          }, 25);
        }),
    });

    let firstError = '-';
    promisedSingleton
      .get()
      .then(() => {
        expect.fail('should not get here');
      })
      .catch(error => {
        firstError = error;
      });

    let secondError = '.';
    promisedSingleton
      .get()
      .then(() => {
        expect.fail('should not get here');
      })
      .catch(error => {
        secondError = error;
      });

    promisedSingleton
      .get()
      .then(() => {
        expect.fail('should not get here');
      })
      .catch(error => {
        expect(error).to.equal(firstError);
        expect(error).to.equal(secondError);
        done();
      });
  });

  it('can be passed an async function', async () => {
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: async (): Promise<string> => {
        await promisedSleep(25);
        return 'foo';
      },
    });
    const result = await promisedSingleton.get();
    expect(result).to.equal('foo');
  });

  it('does not execute the promise until it is requested', async () => {
    let called = false;
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: async (): Promise<string> => {
        called = true;
        return 'foo';
      },
    });
    expect(called).to.be.false;
    await promisedSingleton.get();
    expect(called).to.be.true;
  });

  it('can be reset so the promise gets executed again', async () => {
    let calledCount = 0;
    const promisedSingleton: PromisedSingleton<string> = new PromisedSingleton({
      generator: async (): Promise<string> => {
        calledCount += 1;
        return 'foo';
      },
    });
    expect(calledCount).to.equal(0);
    await promisedSingleton.get();
    expect(calledCount).to.equal(1);
    promisedSingleton.reset();
    expect(calledCount).to.equal(1);
    await promisedSingleton.get();
    expect(calledCount).to.equal(2);
  });

  it('can return an updated external value', async () => {
    let expectedReturn = 0;
    const promisedSingleton: PromisedSingleton<number> = new PromisedSingleton({
      generator: async (): Promise<number> => {
        return expectedReturn;
      },
    });

    const result1 = await promisedSingleton.get();
    expect(result1).to.equal(0);
    expectedReturn = 1;

    // verify the promise didn't update after the external value updated
    const result2 = await promisedSingleton.get();
    expect(result2).to.equal(0);

    // reset then check the value again and it should be udpated
    promisedSingleton.reset();
    const result3 = await promisedSingleton.get();
    expect(result3).to.equal(1);
  });
});
