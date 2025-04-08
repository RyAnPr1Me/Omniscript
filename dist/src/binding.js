"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBinder = void 0;
class DataBinder {
    constructor(signal, element) {
        this.signal = signal;
        this.element = element;
        // Initialize the element with the signal’s value.
        this.element.value = String(this.signal.value);
        // Update signal when input changes.
        this.element.addEventListener('input', () => {
            // For simplicity, assume T can be cast from string.
            this.signal.value = this.element.value;
        });
        // Update element when signal changes.
        this.signal.subscribe(value => {
            if (this.element.value !== String(value)) {
                this.element.value = String(value);
            }
        });
    }
}
exports.DataBinder = DataBinder;
