export const isContains = (value: any, targets: any[]): boolean => {
  if (!value) {
    return false;
  }

  return targets.includes(value);
};
