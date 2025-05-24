import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome, Feather } from '@expo/vector-icons';
import SearchBar from '../../../components/SearchBar';

const Chatbot = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity href="">
          <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.innerContainer}>
              <Feather name="arrow-left" size={30} color="#999" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.heading}>
          <Text className="text-white text-center font-bold text-2xl">
            Indian Market
          </Text>
        </View>

        <TouchableOpacity>
          <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.coinContainer}>
              <Feather name="refresh-cw" size={30} color="#999" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-row justify-between items-center">
          <Feather name="bar-chart-2" size={30} color="#999" />
          <Text className='text-white'>Paid Signal</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Feather name="bar-chart-2" size={30} color="#999" />
          <Text className='text-white'>Free Signal</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Feather name="arrow-left" size={30} color="#999" />
          <Text className='text-white'>AI Chart Patterns</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Interact with the chatbot here.</Text>
    </ScrollView>
  );
};

export default Chatbot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  gradientBorder: {
    borderRadius: 100,
    padding: 1,
  },
  innerContainer: {
    backgroundColor: '#000',
    borderRadius: 100,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  coinContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 100,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  coinText: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    marginLeft: 5,
  },
});