import BigNumber from 'bignumber.js'

export type Params = {
  fn: (...inputs: any[]) => BigNumber;
  fnParams: any[];
  percentTolerance: BigNumber;
  maxIterations: number;
  maxStep: BigNumber;
  goal: BigNumber;
  independentVariableIdx: number;
};

export const IsNanError = TypeError('resulted in NaN');
export const FailedToConvergeError = Error('failed to converge');

const goalSeek = ({
  fn,
  fnParams,
  percentTolerance,
  maxIterations,
  maxStep,
  goal,
  independentVariableIdx,
}: Params): BigNumber => {
  let g: BigNumber;
  let y: BigNumber;
  let y1: BigNumber;
  let oldGuess: BigNumber;
  let newGuess: BigNumber;

  const absoluteTolerance = percentTolerance.div(new BigNumber(100)).times(goal);

  // iterate through the guesses
  for (let i = 0; i < maxIterations; i++) {
    // define the root of the function as the error
    y = fn.apply(null, fnParams).minus(goal);
    if (y.isNaN()) throw IsNanError;

    // was our initial guess a good one?
    if (y.abs().lte(absoluteTolerance.abs())) return fnParams[independentVariableIdx];

    // set the new guess, correcting for maxStep
    oldGuess = fnParams[independentVariableIdx];
    newGuess = oldGuess.plus(y);
    if (newGuess.minus(oldGuess).abs().gt(maxStep)) {
      if (newGuess.gt(oldGuess)) {
        newGuess = oldGuess.plus(maxStep);
      } else {
        newGuess = oldGuess.minus(maxStep);
      }
    }

    fnParams[independentVariableIdx] = newGuess;

    // re-run the fn with the new guess
    y1 = fn.apply(null, fnParams).minus(goal);
    if (y1.isNaN()) throw IsNanError;

    // calculate the error
    g = (y1.minus(y)).div(y);
    if (g.eq(new BigNumber('0'))) g = new BigNumber('0.0001');

    // set the new guess based on the error, correcting for maxStep
    newGuess = oldGuess.minus(y.div(g));
    if (maxStep && newGuess.minus(oldGuess).abs().gt(maxStep)) {
      if (newGuess.gt(oldGuess)) {
        newGuess = oldGuess.plus(maxStep);
      } else {
        newGuess = oldGuess.minus(maxStep);
      }
    }

    fnParams[independentVariableIdx] = newGuess;
  }

  // done with iterations, and we failed to converge
  throw FailedToConvergeError;
};

export default goalSeek;
