export const magicFormula = (value: number, decimal: number = 1000) => {
  return Math.round(value * decimal) / decimal;
};
