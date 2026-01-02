import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const MENU_ITEMS = [
        { label: 'Privacy Policy', icon: 'lock-closed-outline', route: '/settings/privacy' },
        { label: 'How to Use', icon: 'help-circle-outline', route: '/settings/howto' },
        { label: 'Theme', icon: 'color-palette-outline', route: '/settings/theme' }, // Placeholder or modal
        { label: 'About App', icon: 'information-circle-outline', action: () => alert('AI Gallery v1.0.0') },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.header, { color: theme.text }]}>Settings</Text>

            <View style={styles.section}>
                {MENU_ITEMS.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.item, { borderBottomColor: theme.icon + '33' }]}
                        onPress={() => item.route ? router.push(item.route as any) : item.action && item.action()}
                    >
                        <View style={styles.row}>
                            <Ionicons name={item.icon as any} size={24} color={theme.text} style={styles.icon} />
                            <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        marginTop: 40,
    },
    section: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
});
