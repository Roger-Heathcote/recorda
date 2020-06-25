/* Compare the time then to the time now and say how long ago that was in plain English. */

function humaneDate(then, now) {
    if (then === undefined || now === undefined) {
        throw Error("humaneDate requires two times to compare");
    }
    if (!typeof then === typeof 1 || !typeof now === typeof 1) {
        throw Error("humaneDate requires two numbers in ms to compare");
    }
    if (now < then) {
        throw Error("Then time should be lower than now time!");
    }

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const year = 52 * week;

    const diff = now / 1000 - then / 1000;
    if (diff < minute) return "<1m ago";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < week) return `${Math.floor(diff / day)}d ago`;
    if (diff < year) return `${Math.floor(diff / week)}w ago`;
    return `${Math.floor(diff / year)}y ago`;
}

module.exports = {
    humaneDate
};
