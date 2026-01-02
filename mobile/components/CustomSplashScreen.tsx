import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';

export default function CustomSplashScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Theme Colors
    const backgroundColor = isDark ? '#0a192f' : '#e6f4fe'; // Dark Blue vs Light Blue
    const textColor = isDark ? '#e6f4fe' : '#0a192f'; // Contrast text

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const moveAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500, // Slow fade in
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
                toValue: 0,
                duration: 1500,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.centerContent}>
                <Animated.Image
                    source={require('../assets/images/custom-icon.png')}
                    style={[
                        styles.icon,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }, { translateY: moveAnim }]
                        }
                    ]}
                    resizeMode="contain"
                />
                <Animated.Text style={[
                    styles.title,
                    {
                        color: textColor,
                        opacity: fadeAnim,
                        transform: [{ translateY: moveAnim }]
                    }
                ]}>
                    AI Photo Prompt
                </Animated.Text>
            </View>

            <Animated.View style={[
                styles.footer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: moveAnim }]
                }
            ]}>
                <Text style={[styles.footerText, { color: textColor }]}>- Pearl Production</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        width: 160,
        height: 160,
        marginBottom: 25,
        borderRadius: 80, // Perfectly round
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 10,
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 18,
        fontWeight: '500',
        opacity: 0.9,
        fontStyle: 'italic',
    },
});
