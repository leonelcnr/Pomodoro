import { useState, useCallback, useEffect } from 'react';

export function useDocumentPiP() {
    const [isSupported, setIsSupported] = useState(false);
    const [pipWindow, setPipWindow] = useState<Window | null>(null);

    useEffect(() => {
        setIsSupported('documentPictureInPicture' in window);
    }, []);

    const requestPiP = useCallback(async (optionsContext?: { width?: number; height?: number }) => {
        if (!isSupported || !window.documentPictureInPicture) {
            console.warn('Document Picture-in-Picture API is not supported in this browser.');
            return null;
        }

        try {
            // Close existing PiP window if it exists
            if (window.documentPictureInPicture.window) {
                window.documentPictureInPicture.window.close();
            }

            const pip = await window.documentPictureInPicture.requestWindow({
                width: optionsContext?.width || 300,
                height: optionsContext?.height || 200,
            });

            // Copy exactly the stylesheets to the new window
            [...document.styleSheets].forEach((styleSheet) => {
                try {
                    const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                    const style = document.createElement('style');
                    style.textContent = cssRules;
                    pip.document.head.appendChild(style);
                } catch (e) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    if (styleSheet.href) {
                        link.href = styleSheet.href;
                        pip.document.head.appendChild(link);
                    }
                }
            });

            // Copy root classes for theme support (e.g. Tailwind dark mode)
            pip.document.documentElement.className = document.documentElement.className;
            pip.document.documentElement.style.cssText = document.documentElement.style.cssText;
            
            // Keep theme in sync via a MutationObserver
            const observer = new MutationObserver(() => {
                pip.document.documentElement.className = document.documentElement.className;
                pip.document.documentElement.style.cssText = document.documentElement.style.cssText;
            });
            observer.observe(document.documentElement, { attributes: true });

            setPipWindow(pip);

            // Listen for when the user closes the PiP window natively
            pip.addEventListener('pagehide', () => {
                observer.disconnect();
                setPipWindow(null);
            });

            return pip;
        } catch (error) {
            console.error('Failed to open PiP window:', error);
            setPipWindow(null);
            return null;
        }
    }, [isSupported]);

    const closePiP = useCallback(() => {
        if (pipWindow) {
            pipWindow.close();
            setPipWindow(null);
        }
    }, [pipWindow]);

    return { isSupported, pipWindow, requestPiP, closePiP };
}
