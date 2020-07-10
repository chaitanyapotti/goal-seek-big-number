import BigNumber from 'bignumber.js'
import goalSeek, { IsNanError, FailedToConvergeError } from '../src';

describe('goalSeek', () => {
  test('a simple linear equation', () => {
    let x = 10;
    const fn = (x: BigNumber): BigNumber => x.plus(new BigNumber(2));
    const fnParams = [new BigNumber(x)];

    const result = goalSeek({
      fn,
      fnParams,
      percentTolerance: new BigNumber(1),
      maxIterations: 1000,
      maxStep: new BigNumber('10'),
      goal: new BigNumber('100'),
      independentVariableIdx: 0
    })
    expect(result.toNumber()).toBeGreaterThanOrEqual(97);
    expect(result.toNumber()).toBeLessThanOrEqual(99);
  })

  test('a simple polynomial', () => {
    let x = 90;
    const fn = (x: BigNumber): BigNumber => x.times(x);
    const fnParams = [new BigNumber(x)];

    const result = goalSeek({
      fn,
      fnParams,
      percentTolerance: new BigNumber(1),
      maxIterations: 1000,
      maxStep: new BigNumber(1),
      goal: new BigNumber(10000),
      independentVariableIdx: 0
    })
    expect(result.toNumber()).toBeGreaterThanOrEqual(99);
    expect(result.toNumber()).toBeLessThanOrEqual(101);
  })

  test('throws on NaN', done => {
    let x = 10;
    const fn = (x: BigNumber): BigNumber => new BigNumber(Math.log(-1));
    const fnParams = [new BigNumber(x)];

    try {
      const result = goalSeek({
        fn,
        fnParams,
        percentTolerance: new BigNumber(1),
        maxIterations: 1000,
        maxStep: new BigNumber(10),
        goal: new BigNumber(100),
        independentVariableIdx: 0
      })

      done.fail('expected to throw') 
    } catch(e) {
      expect(e).toEqual(IsNanError);
      done()
    }
  })

  test('throws on convergence failure', done => {
    let x = 10;
    const fn = (x: BigNumber): BigNumber => x.times(x);
    const fnParams = [new BigNumber(x)];

    try {
      const result = goalSeek({
        fn,
        fnParams,
        percentTolerance: new BigNumber(1),
        maxIterations: 10,
        maxStep: new BigNumber(10),
        goal: new BigNumber(-1),
        independentVariableIdx: 0
      })

      done.fail('expected to throw') 
    } catch(e) {
      expect(e).toEqual(FailedToConvergeError);
      done()
    }
  })
});
