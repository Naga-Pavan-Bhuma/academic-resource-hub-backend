// utils/pointsLevelService.js
import User from "../models/User.js";
import Achievement from "../models/Achievement.js";
import { LEVELS, detectLevelUp } from "./levelsConfig.js";
import { logActivity } from "./logActivity.js";

// delta > 0 (points to add)
export const addPointsAndHandleLevelUp = async (userId, delta) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const oldPoints = user.points || 0;
  const newPoints = oldPoints + delta;

  user.points = newPoints;
  await user.save();

  const newLevel = detectLevelUp(oldPoints, newPoints);

  if (newLevel) {
    // ✅ Persist achievement
    await Achievement.create({
      userId,
      type: "levelup",
      title: `Reached ${newLevel.name}`,
      levelKey: newLevel.key,
      levelName: newLevel.name,
      points: newPoints,
      meta: { from: oldPoints, to: newPoints },
    });

    // ✅ Log activity (also emits `activity:new` & `level:up`)
    await logActivity(
      userId,
      "levelup",
      `Reached ${newLevel.name} (${newPoints} pts) 🏆`
    );
  }

  return {
    points: newPoints,
    leveledUp: !!newLevel,
    newLevel,
  };
};
