'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

/**
 * Proveedor de temas para la aplicación
 * 
 * Este componente envuelve la aplicación y proporciona:
 * - Gestión del tema (light/dark/system)
 * - Persistencia del tema en localStorage
 * - Sincronización con las preferencias del sistema
 * 
 * @param children - Componentes hijos que tendrán acceso al contexto del tema
 * @param props - Configuraciones adicionales del ThemeProvider
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
