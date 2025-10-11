import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import images from '@/constants/images';

const NewsDetail = () => {
    const { article: articleString } = useLocalSearchParams();
    const router = useRouter();

    // console.log('NewsDetail searchParams:', { article: articleString });

    const article = articleString
        ? JSON.parse(articleString)
        : {
            title: 'No Title',
            description: 'No description available',
            content: 'No content available',
            source: 'Unknown',
            timestamp: 'N/A',
            image: images.courseimg,
            url: '#',
        };

    const cleanedContent = article.content
        ? article.content.replace(/\[\+\d+ chars\]/, '').trim()
        : 'No content available';

    const displayContent = cleanedContent.length > 2000
        ? cleanedContent.substring(0, 2000) + '…'
        : cleanedContent;

    const imageSource = typeof article.image === 'string' && article.image.startsWith('http')
        ? { uri: article.image }
        : images.courseimg;

    const handleOpenLink = () => {
        // console.log('handleOpenLink called, URL:', article.url);
        if (article.url && article.url !== '#' && article.url.startsWith('http')) {
            // console.log('Navigating to WebViewScreen');
            router.push({ pathname: './WebViewScreen', params: { url: article.url } });
        } else {
            console.warn('No valid URL provided:', article.url);
            Alert.alert('Invalid Link', 'This article does not have a valid URL.');
        }
    };

    if (!articleString) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Article Not Found</Text>
                <Text style={styles.description}>No article data was provided.</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.title}>{article.title}</Text>
                <View style={styles.meta}>
                    <Text style={styles.source}>{article.source}</Text>
                    <Text style={styles.timestamp}>{article.timestamp}</Text>
                </View>
                <Text style={styles.description}>{article.description}</Text>
                <Text style={styles.contentText}>{displayContent}</Text>
                <TouchableOpacity style={styles.button} onPress={handleOpenLink}>
                    <Text style={styles.buttonText}>Read Full Article</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    source: {
        color: '#aaa',
        fontSize: 14,
    },
    timestamp: {
        color: '#aaa',
        fontSize: 14,
    },
    description: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    contentText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#6200ea',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 10,
        alignSelf: 'flex-start',
    },
});

export default NewsDetail;