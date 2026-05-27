import React from 'react';
import {initTheme, toggleTheme} from './theme.js';

/**
 * PUBLIC_INTERFACE
 * Main application component.
 * @return {JSX.Element}
 */
export default function App() {
    const [theme, setTheme] = React.useState('light');

    React.useEffect(() => {
        // Initialize theme exactly once on app load.
        setTheme(initTheme());
    }, []);

    function onToggleTheme() {
        setTheme((prev) => toggleTheme(prev));
    }

    return (
        <div className="appShell">
            <header className="topBar">
                <div className="brand">
                    <div className="brandTitle">React Calculator</div>
                    <div className="brandSub">Demo app with Dark Mode Toggle</div>
                </div>

                <button
                    type="button"
                    className="themeToggle"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <span className="themeToggleLabel">Theme</span>
                    <span className="themeToggleValue">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                </button>
            </header>

            <main className="content">
                <section className="card">
                    <h1 className="h1">Dark mode is enabled via CSS variables</h1>
                    <p className="p">
                        Your preference is saved in <code>localStorage</code> and re-applied on refresh.
                    </p>
                </section>
            </main>
        </div>
    );
}
