import { Signal } from './reactive';

export class DataBinder<T> {
  constructor(private signal: Signal<T>, private element: HTMLInputElement) {
    // Initialize the element with the signal’s value.
    this.element.value = String(this.signal.value);
    
    // Update signal when input changes.
    this.element.addEventListener('input', () => {
      // For simplicity, assume T can be cast from string.
      this.signal.value = this.element.value as unknown as T;
    });
    
    // Update element when signal changes.
    this.signal.subscribe(value => {
      if (this.element.value !== String(value)) {
        this.element.value = String(value);
      }
    });
  }
}
