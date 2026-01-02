import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <>
            <Stack.Screen options={{ title: 'Privacy Policy', headerBackTitle: 'Back' }} />
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Data Collection</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    We do not collect any personal data. All your liked images are stored locally on your device.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Image Usage</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    Images generated are for personal use. We do not claim ownership of AI-generated content.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Third Party Services</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    We use Expo for app services. Please review their policies for more information.
                </Text>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 15, marginBottom: 5 },
    text: { fontSize: 16, lineHeight: 24, opacity: 0.8 }
});
