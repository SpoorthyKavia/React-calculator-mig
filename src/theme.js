/**
 * @fileoverview Theme utilities for toggling dark/light mode with persistence.
 */

const THEME_STORAGE_KEY = 'theme';

/** @typedef {'light'|'dark'} Theme */

/**
 * Returns the OS-level preferred theme.
 * @return {Theme}
 */
function getSystemPreferredTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Reads theme preference from localStorage.
 * @return {Theme|null}
 */
function readStoredTheme() {
    if (typeof window === 'undefined') {
        return null;
    }
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'dark' || raw === 'light' ? raw : null;
}

/**
 * Persists theme preference to localStorage.
 * @param {Theme} theme
 */
function storeTheme(theme) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Applies the theme to the document root element using a data attribute.
 * @param {Theme} theme
 */
function applyThemeToDom(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

/**
 * PUBLIC_INTERFACE
 * Initialize the theme on first load using:
 * 1) stored preference if present, else
 * 2) system preference.
 * @return {Theme} applied theme
 */
export function initTheme() {
    const theme = readStoredTheme() ?? getSystemPreferredTheme();
    applyThemeToDom(theme);
    return theme;
}

/**
 * PUBLIC_INTERFACE
 * Toggle between light and dark themes, applying to DOM and persisting.
 * @param {Theme} currentTheme
 * @return {Theme} next theme
 */
export function toggleTheme(currentTheme) {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyThemeToDom(nextTheme);
    storeTheme(nextTheme);
    return nextTheme;
}
