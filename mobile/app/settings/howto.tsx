import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function HowToScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <>
            <Stack.Screen options={{ title: 'How to Use', headerBackTitle: 'Back' }} />
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>How to Use Fusion Gallery</Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>• Browse Images</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    Scroll through the Home feed to discover amazing AI-generated art.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>• Search</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    Use the search bar to find images by prompt keywords or style (e.g., "Cyberpunk", "Nature").
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>• Like & Save</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    Double-tap an image or hit the heart icon to save it to your Favorites tab.
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>• Copy Prompts</Text>
                <Text style={[styles.text, { color: theme.text }]}>
                    Tap on an image to see details, then click "Copy Prompt" to use it yourself!
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
