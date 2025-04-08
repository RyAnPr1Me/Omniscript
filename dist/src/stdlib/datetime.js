"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTime = void 0;
class DateTime {
    constructor(input) {
        this.date = input ? new Date(input) : new Date();
    }
    format(pattern) {
        return this.date.toLocaleString(undefined, { dateStyle: 'full' });
    }
    add(amount, unit) {
        const newDate = new Date(this.date);
        switch (unit) {
            case 'days':
                newDate.setDate(newDate.getDate() + amount);
                break;
            case 'hours':
                newDate.setHours(newDate.getHours() + amount);
                break;
            case 'minutes':
                newDate.setMinutes(newDate.getMinutes() + amount);
                break;
        }
        return new DateTime(newDate);
    }
    static now() {
        return new DateTime();
    }
}
exports.DateTime = DateTime;
