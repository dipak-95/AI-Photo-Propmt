import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useNativeColorScheme();
    const [theme, setThemeState] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        // Load saved theme on mount
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('app_theme');
                if (savedTheme) {
                    setThemeState(savedTheme as ThemeMode);
                }
            } catch (error) {
                console.error('Failed to load theme', error);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (mode: ThemeMode) => {
        setThemeState(mode);
        try {
            await AsyncStorage.setItem('app_theme', mode);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
