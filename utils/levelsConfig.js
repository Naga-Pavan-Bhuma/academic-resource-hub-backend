// utils/levelsConfig.js

// Keep this in sync with frontend levels.js
export const LEVELS = [
  { key: "starter", name: "Starter", threshold: 0 },
  { key: "bronze", name: "Bronze", threshold: 200 },
  { key: "silver", name: "Silver", threshold: 500 },
  { key: "gold", name: "Gold", threshold: 1000 },
  { key: "legend", name: "Legend", threshold: 2500 },
];

export const getLevelByPoints = (points = 0) => {
  let current = LEVELS[0];
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].threshold) {
      current = LEVELS[i];
    } else {
      break;
    }
  }
  return current;
};

export const detectLevelUp = (oldPoints = 0, newPoints = 0) => {
  const oldLevel = getLevelByPoints(oldPoints);
  const newLevel = getLevelByPoints(newPoints);

  if (newLevel.key !== oldLevel.key) {
    return newLevel; // user crossed into a new level
  }
  return null;
};
