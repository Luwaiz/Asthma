/**
 * Helper to check if two dates are the same day (UTC)
 */
const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth() &&
        date1.getUTCDate() === date2.getUTCDate();
};

/**
 * Helper to check if d1 is yesterday relative to d2 (UTC)
 */
const isYesterday = (d1, d2) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const yesterday = new Date(date2);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return isSameDay(date1, yesterday);
};

module.exports = {
    isSameDay,
    isYesterday
};
