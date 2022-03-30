import { setupFilters, getFilterStatus } from './filters.js';
import setupLayout from './layout.js';



/* setup */
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('spacesloaded', () => {
        renderList();
        lazyLoadSpaceImages( imageBaseURL );
        updateDistances();
    });
    loadSpaces();
});