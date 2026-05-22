/**
 * Middleware to verify if the current time is within working hours
 * Working hours: Monday to Friday, 9 AM to 5 PM
 */
function workingHoursMiddleware(req, res, next) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = now.getHours();

  // Check if it's a weekday (Monday = 1, Friday = 5)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  // Check if it's within working hours (9 to 17, meaning 9:00 to 16:59)
  const isWorkingHour = hours >= 9 && hours < 17;

  if (isWeekday && isWorkingHour) {
    // Within working hours, proceed
    next();
  } else {
    // Outside working hours
    res.status(503).render('closed', {
      currentTime: now.toLocaleString(),
      dayName: getDayName(dayOfWeek),
      hours: hours
    });
  }
}

function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

module.exports = workingHoursMiddleware;
