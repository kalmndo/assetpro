export default function isTodayOrAfter(targetDate: Date | null) {
  if (!targetDate) {
    return false
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to midnight for an accurate comparison
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0); // Set the time to midnight for an accurate comparison

  return today >= target;
}