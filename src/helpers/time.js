import { toZonedTime } from "date-fns-tz"

function parseDuration(durationStr) {
  if (!durationStr) return 0;
  const [h, m, s] = durationStr.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export const getTimeLeft = (activatedAt, durationStr, timeZone = "UTC") => {
  if (!activatedAt || !durationStr) return 0;

  // Ensure we have a Date object
  const activatedDate = activatedAt instanceof Date
    ? activatedAt
    : new Date(activatedAt);

  // Convert to target timezone
  const zonedActivated = toZonedTime(activatedDate, timeZone);
  const activatedTime = zonedActivated.getTime();

  const durationSeconds = parseDuration(durationStr);
  const endTime = activatedTime + durationSeconds * 1000;

  // "now" also zoned
  const zonedNow = toZonedTime(new Date(), timeZone).getTime();

  const timeLeft = endTime - zonedNow;
  return timeLeft > 0 ? timeLeft : 0;
};
