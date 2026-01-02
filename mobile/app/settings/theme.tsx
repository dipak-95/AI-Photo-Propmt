import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme'; // This now uses our context!
import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ThemeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Get the setter from context directly
    const { setTheme, theme: currentTheme } = useTheme();

    return (
        <>
            <Stack.Screen options={{ title: 'Theme Settings', headerBackTitle: 'Back' }} />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Choose Appearance</Text>

                <TouchableOpacity
                    style={[
                        styles.option,
                        {
                            borderColor: theme.text,
                            backgroundColor: currentTheme === 'light' ? theme.tint + '20' : 'transparent'
                        }
                    ]}
                    onPress={() => setTheme('light')}
                >
                    <View style={styles.row}>
                        <Ionicons name="sunny-outline" size={24} color={theme.text} style={styles.icon} />
                        <Text style={[styles.text, { color: theme.text }]}>Light Mode</Text>
                    </View>
                    {currentTheme === 'light' && <Ionicons name="checkmark-circle" size={24} color={theme.tint} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        {
                            borderColor: theme.text,
                            backgroundColor: currentTheme === 'dark' ? theme.tint + '20' : 'transparent'
                        }
                    ]}
                    onPress={() => setTheme('dark')}
                >
                    <View style={styles.row}>
                        <Ionicons name="moon-outline" size={24} color={theme.text} style={styles.icon} />
                        <Text style={[styles.text, { color: theme.text }]}>Dark Mode</Text>
                    </View>
                    {currentTheme === 'dark' && <Ionicons name="checkmark-circle" size={24} color={theme.tint} />}
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, marginTop: 10 },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
        opacity: 0.9
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 15,
    },
    text: { fontSize: 18, fontWeight: '500' }
});
