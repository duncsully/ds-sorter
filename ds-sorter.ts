import { DsSorter } from './src/DsSorter.js';

window.customElements.define('ds-sorter', DsSorter);

declare global {
    interface HTMLElementTagNameMap {
        'ds-sorter': DsSorter;
    }
}