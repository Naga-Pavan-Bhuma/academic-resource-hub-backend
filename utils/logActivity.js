import Activity from "../models/Activity.js";

export const logActivity = async (userId, action, message) => {
  try {
    const activity = await Activity.create({
      userId,
      action,
      message,
    });

    const payload = {
      _id: activity._id,
      userId,
      action,
      message,
      createdAt: activity.createdAt,
    };

    if (global._io) {
      // generic activity stream
      global._io.emit("activity:new", payload);

      // special event for level-ups (for fancy UI if needed)
      if (action === "levelup") {
        global._io.emit("level:up", payload);
      }
    }
  } catch (err) {
    console.error("Activity Log Error:", err);
  }
};
