import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { downloadAsync, cacheDirectory } from 'expo-file-system/legacy'; // Use Legacy API to fix error

export default function ImageDetailScreen() {
    const { id, imageUrl, prompt } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const copyPrompt = async () => {
        await Clipboard.setStringAsync(prompt as string);
        Alert.alert('Copied!', 'Prompt copied to clipboard.');
    };

    const shareImage = async () => {
        if (Platform.OS === 'web') {
            Alert.alert('Not supported on web');
            return;
        }

        let step = 'start';
        let targetUrl = '';

        try {
            // 1. Prepare URL
            step = 'url_prep';
            let urlString = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;

            if (!urlString) {
                throw new Error('No image URL provided');
            }

            // FILTER: Fix localhost URLs for mobile devices
            const cleanIp = '192.168.174.169';
            if (urlString.includes('localhost')) {
                urlString = urlString.replace('localhost', cleanIp);
            } else if (urlString.includes('127.0.0.1')) {
                urlString = urlString.replace('127.0.0.1', cleanIp);
            }
            targetUrl = urlString;

            // 2. Define Local Path
            step = 'path_def';
            const filename = `share_${Date.now()}.jpg`; // Unique name
            const fileUri = cacheDirectory + filename;

            // 3. Download
            step = 'download';
            const downloadRes = await downloadAsync(targetUrl, fileUri);

            if (downloadRes.status !== 200) {
                throw new Error(`Download failed (Status ${downloadRes.status})`);
            }

            // 4. Share
            step = 'share_sheet';
            await Sharing.shareAsync(downloadRes.uri, {
                mimeType: 'image/jpeg',
                dialogTitle: 'Share AI Image',
                UTI: 'public.jpeg'
            });

        } catch (error: any) {
            console.error(`Status: ${step}`, error);
            Alert.alert(
                'Share Error',
                `Failed at step "${step}".\n\nURL: ${targetUrl}\n\nError: ${error.message}`
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                title: 'Image Detail',
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text
            }} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl as string }} style={styles.image} resizeMode="contain" />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.label, { color: theme.icon }]}>Prompt</Text>
                    <View style={[styles.promptBox, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
                        <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
                    </View>

                    <View style={styles.actions}>
                        {/* Primary Button */}
                        <TouchableOpacity
                            style={[
                                styles.btn,
                                {
                                    backgroundColor: colorScheme === 'dark' ? '#fff' : theme.tint,
                                    shadowColor: theme.tint,
                                    shadowOpacity: 0.3,
                                    shadowRadius: 5,
                                    elevation: 4
                                }
                            ]}
                            onPress={copyPrompt}
                        >
                            <Ionicons name="copy-outline" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                            <Text style={[styles.btnText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Copy Prompt</Text>
                        </TouchableOpacity>

                        {/* Secondary Button */}
                        <TouchableOpacity
                            style={[
                                styles.btn,
                                {
                                    backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
                                    borderWidth: colorScheme === 'dark' ? 1 : 0,
                                    borderColor: 'rgba(255,255,255,0.1)'
                                }
                            ]}
                            onPress={shareImage}
                        >
                            <Ionicons name="share-social-outline" size={20} color={theme.text} />
                            <Text style={[styles.btnText, { color: theme.text }]}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 400,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    promptBox: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 25,
    },
    promptText: {
        fontSize: 16,
        lineHeight: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    btnText: {
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
});
