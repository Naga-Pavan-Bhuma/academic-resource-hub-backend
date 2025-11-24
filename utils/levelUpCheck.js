import { LEVELS } from "./levelsConfig.js"; // we’ll create this small config

export const getLevelByPoints = (points) => {
  let curr = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].threshold) curr = LEVELS[i];
  }
  return curr;
};

export const detectLevelUp = (oldPoints, newPoints) => {
  const oldLevel = getLevelByPoints(oldPoints);
  const newLevel = getLevelByPoints(newPoints);

  return oldLevel.key !== newLevel.key
    ? newLevel
    : null;
};
