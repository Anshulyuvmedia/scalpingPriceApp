// components/SearchBar.jsx
import { StyleSheet, View, TextInput } from 'react-native';
import React from 'react';
import { AntDesign } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

const SearchBar = () => {
    return (
        <View>
            {/* Outer LinearGradient to create the gradient border */}
            <LinearGradient
                colors={['#444', '#AEAED4']} // Gradient from black (left) to white (right)
                start={{ x: 1, y: 0 }} // Start at the left
                end={{ x: 0, y: 0 }} // End at the right
                style={styles.gradientBorder}
            >
                {/* Inner View to create the "border" effect and contain the search bar content */}
                <View style={styles.innerContainer} className="flex flex-row items-center">
                    <AntDesign name="search1" size={22} color="#AFAFAF" />
                    <TextInput
                        placeholder="Search for 'Nestle'"
                        placeholderTextColor="#888"
                        style={styles.textInput}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: 100,
        padding: 1, // This acts as the "border" width
        marginHorizontal: 15,
    },
    innerContainer: {
        backgroundColor: '#000', // Matches the original searchBar background
        borderRadius: 100, // Matches the outer borderRadius
        paddingHorizontal: 25,
        paddingVertical: 2,
        flexDirection: 'row', // Already handled by className, but added for clarity
        alignItems: 'center',
    },
    textInput: {
        color: '#FFF',
        flex: 1, // Ensures the TextInput takes up remaining space
        marginLeft: 5, // Adds spacing between the icon and input
        fontFamily: 'Questrial-Regular',
        fontSize: 14,
    },
});