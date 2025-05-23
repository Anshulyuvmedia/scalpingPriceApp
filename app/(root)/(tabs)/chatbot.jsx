import { StyleSheet, Text, View } from 'react-native';
  import React from 'react';

  const Chatbot = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Chatbot</Text>
        <Text style={styles.subtitle}>Interact with the chatbot here.</Text>
      </View>
    );
  };

  export default Chatbot;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e1e1e',
    },
    title: {
      color: '#fff',
      fontSize: 24,
      fontFamily: 'SpaceMono',
      fontWeight: 'bold',
    },
    subtitle: {
      color: '#fff',
      fontSize: 18,
      fontFamily: 'SpaceMono',
    },
  });