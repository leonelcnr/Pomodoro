'use client';

import * as React from 'react';
import { flushSync } from 'react-dom';

type ThemeSelection = 'light' | 'dark';
type Resolved = 'light' | 'dark';
type Direction = 'btt' | 'ttb' | 'ltr' | 'rtl';

type ChildrenRender =
  | React.ReactNode
  | ((state: {
    resolved: Resolved;
    effective: ThemeSelection;
    toggleTheme: (theme: ThemeSelection) => void;
  }) => React.ReactNode);

function getClipKeyframes(direction: Direction): [string, string] {
  switch (direction) {
    case 'ltr':
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
    case 'rtl':
      return ['inset(0 0 0 100%)', 'inset(0 0 0 0)'];
    case 'ttb':
      return ['inset(0 0 100% 0)', 'inset(0 0 0 0)'];
    case 'btt':
      return ['inset(100% 0 0 0)', 'inset(0 0 0 0)'];
    default:
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)'];
  }
}

type ThemeTogglerProps = {
  theme: ThemeSelection;
  resolvedTheme: Resolved;
  setTheme: (theme: ThemeSelection) => void;
  direction?: Direction;
  onImmediateChange?: (theme: ThemeSelection) => void;
  children?: ChildrenRender;
};

function ThemeToggler({
  theme,
  resolvedTheme,
  setTheme,
  onImmediateChange,
  direction = 'ltr',
  children,
  ...props
}: ThemeTogglerProps) {
  const [preview, setPreview] = React.useState<null | {
    effective: ThemeSelection;
    resolved: Resolved;
  }>(null);
  const [current, setCurrent] = React.useState<{
    effective: ThemeSelection;
    resolved: Resolved;
  }>({
    effective: theme,
    resolved: resolvedTheme,
  });

  // Sincronizar current con las props cuando cambian
  React.useEffect(() => {
    setCurrent({
      effective: theme,
      resolved: resolvedTheme,
    });
  }, [theme, resolvedTheme]);

  React.useEffect(() => {
    if (
      preview &&
      theme === preview.effective &&
      resolvedTheme === preview.resolved
    ) {
      setPreview(null);
    }
  }, [theme, resolvedTheme, preview]);

  const [fromClip, toClip] = getClipKeyframes(direction);

  const toggleTheme = React.useCallback(
    async (newTheme: ThemeSelection) => {
      // Como ya no usamos 'system', el tema resuelto es el mismo que el tema seleccionado
      const newResolved = newTheme as Resolved;

      // Llamar al callback inmediato
      onImmediateChange?.(newTheme);

      // Si el tema no cambia, no hacer nada
      if (newResolved === resolvedTheme) {
        return;
      }

      // Si el navegador no soporta View Transitions, cambiar sin animación
      if (!document.startViewTransition) {
        setTheme(newTheme);
        return;
      }

      // Preparar la transición
      await document.startViewTransition(() => {
        flushSync(() => {
          setPreview({ effective: newTheme, resolved: newResolved });
          document.documentElement.classList.toggle(
            'dark',
            newResolved === 'dark',
          );
        });
      }).ready;

      // Animar la transición
      document.documentElement
        .animate(
          { clipPath: [fromClip, toClip] },
          {
            duration: 700,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        )
        .finished.finally(() => {
          setTheme(newTheme);
        });
    },
    [onImmediateChange, resolvedTheme, fromClip, toClip, setTheme],
  );

  // Usar preview si está disponible, de lo contrario usar current
  const displayState = preview || current;

  return (
    <React.Fragment {...props}>
      {typeof children === 'function'
        ? children({
          effective: displayState.effective,
          resolved: displayState.resolved,
          toggleTheme,
        })
        : children}
      <style>{`::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
    </React.Fragment>
  );
}

export {
  ThemeToggler,
  type ThemeTogglerProps,
  type ThemeSelection,
  type Resolved,
  type Direction,
};
