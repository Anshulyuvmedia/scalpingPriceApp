// app/(root)/(tabs)/chatbot.jsx
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import TabNavigationHeader from '../../components/TabNavigationHeader';
import FutureTab from './(tabs)/chatbot/tabview/FutureTab';
import GraphTab from './(tabs)/chatbot/tabview/GraphTab';
import IndexTab from './(tabs)/chatbot/tabview/IndexTab';
import StocksTab from './(tabs)/chatbot/tabview/StocksTab';

const initialLayout = { width: Dimensions.get('window').width };

const Chatbot = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'index', title: 'Index' },
    { key: 'stocks', title: 'Stocks' },
    { key: 'futures', title: 'Futures' },
    { key: 'graphs', title: 'Graphs' },
  ]);

  const renderScene = SceneMap({
    index: IndexTab,
    stocks: StocksTab,
    futures: FutureTab,
    graphs: GraphTab,
  });

  const renderTabBar = (props) => (
    <LinearGradient
      colors={['#AEAED4', '#000', '#AEAED4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBoxBorder}
    >
      <TabBar
        {...props}
        scrollEnabled
        indicatorStyle={styles.tabIndicator}
        style={styles.tabBar}
        labelStyle={styles.tabLabel}
        tabStyle={styles.tabStyle}
      />
    </LinearGradient>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
          <Text style={styles.title}>Indian Market</Text>
        </View>

        <TouchableOpacity>
          <LinearGradient
            colors={['#AEAED4', '#000', '#AEAED4']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.coinContainer}>
              <Feather name="refresh-cw" size={26} color="#999" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TabNavigationHeader activeTab="PaidSignal" />

      <View style={styles.tabViewContainer}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          lazy
          renderTabBar={renderTabBar}
        />
      </View>
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
    fontFamily: 'Sora-Bold',
    textAlign: 'center',
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 1,
  },
  gradientBoxBorder: {
    borderRadius: 25,
    padding: 1, // Gradient border thickness
    marginHorizontal: 5,
    marginBottom: 15,
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
  },
  coinContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 100,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  tabViewContainer: {
    height: 'auto', // Remove fixed height
    minHeight: 600, // Ensure minimum height
  },
  tabBar: {
    backgroundColor: '#1e1e1e', // Match the container background
    borderRadius: 25, // Match the gradient border radius
  },
  tabIndicator: {
    backgroundColor: '#34C759',
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    color: '#FFF',
    fontFamily: 'Questrial-Regular',
    fontSize: 14,
  },
  tabStyle: {
    width: 'auto',
    paddingHorizontal: 10,
  },
});