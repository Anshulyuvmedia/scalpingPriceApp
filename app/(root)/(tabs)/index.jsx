import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
// import { PieChart } from 'react-native-chart-kit';
import { FontAwesome, Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import SearchBar from '../../../components/SearchBar'; // Assuming this is a custom component

const screenWidth = Dimensions.get('window').width;

const Index = () => {
  // Data for the PieChart
  const chartData = [
    { name: 'Others', value: 52.14, color: '#34C759' },
    { name: 'HDFCLIFE', value: -12.82, color: '#FF3B30' },
    { name: 'JSWSTEEL', value: 12.41, color: '#28A745' },
    { name: 'SHRIRAMFIN', value: 12.04, color: '#20C997' },
    { name: 'ADANIPORTS', value: 10.32, color: '#17A2B8' },
    { name: 'TECHM', value: 9.32, color: '#007BFF' },
    { name: 'TITAN', value: 8.76, color: '#6610F2' },
    { name: 'Apollohosp', value: 16.90, color: '#28A745' },
    { name: 'Grasim', value: 16.80, color: '#20C997' },
    { name: 'Ultracemco', value: 19.11, color: '#17A2B8' },
  ];

  // Data for the Call vs Put slider
  const callPercentage = 60;
  const putPercentage = 40;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity href="">
          <LinearGradient
            colors={['#AEAED4', '#444', '#AEAED4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.innerContainer}>
              <FontAwesome name="user-circle" size={30} color="#FFD700" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <SearchBar />
        </View>

        <TouchableOpacity>
          <LinearGradient
            colors={['#444', '#AEAED4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.coinContainer}>
              <FontAwesome name="bitcoin" size={20} color="#FFD700" />
              <Text style={styles.coinText}>400</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* News and FX Signal Buttons */}
      <View style={styles.buttonRow}>
        <LinearGradient
          colors={['#000', '#AEAED4']}
          start={{ x: 0.2, y: 1.2 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBorder}
        >
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="newspaper-o" size={22} color="#FFF" style={styles.iconMargin} />
            <Text style={styles.buttonText}>NEWS</Text>
            <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={['#000', '#fff']}
          start={{ x: 0.2, y: 1.2 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBorder}
        >
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="dollar" size={16} color="#FFF" style={styles.iconMargin} />
            <Text style={styles.buttonText}>FX SIGNAL</Text>
            <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* NIFTY 50 Index Section */}
      <View style={styles.indexSection}>
        <LinearGradient
          colors={['#000', '#fff']}
          start={{ x: 0.2, y: 1.2 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#000', '#1A3B76']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.indexCard}>
              <View style={styles.indexHeader}>
                <Text style={styles.indexTitle}>Nifty 50</Text>
                <View style={styles.indexChangeContainer}>
                  <Feather name="arrow-up-right" size={16} color="#34C759" style={styles.iconMargin} />
                  <Text style={styles.indexChangePositive}>1.2%</Text>
                </View>
              </View>
              <Text style={styles.indexValue}>18,245.32</Text>
            </View>
          </LinearGradient>
        </LinearGradient>

        <LinearGradient
          colors={['#000', '#fff']}
          start={{ x: 0.2, y: 1.2 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBoxBorder}
        >
          <LinearGradient
            colors={['#000', '#7A2C3F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.innerGradient}
          >
            <View style={styles.indexCard}>
              <View style={styles.indexHeader}>
                <Text style={styles.indexTitle}>NIFTY 50</Text>
                <View style={styles.indexChangeContainer}>
                  <Feather name="arrow-up-right" size={16} color="#FF3B30" style={styles.iconMargin} />
                  <Text style={styles.indexChangeNegative}> 0.8%</Text>
                </View>
              </View>
              <Text style={styles.indexValue}>61,232.45</Text>
            </View>
          </LinearGradient>
        </LinearGradient>
      </View>

      {/* Open Interest Slider */}
      <View style={styles.sliderSection}>
        <Text style={styles.sliderTitle}>Open Interest: Call vs Put</Text>
        <View style={styles.slider}>
          <View style={styles.sliderBar}>
            <View style={[styles.callBar, { width: `${callPercentage}%` }]} />
            <View style={[styles.putBar, { width: `${putPercentage}%` }]} />
          </View>
          <Text style={styles.sliderLabelLeft}>Call: {callPercentage}%</Text>
          <Text style={styles.sliderLabelRight}>Put: {putPercentage}%</Text>
        </View>
      </View>

      {/* Pie Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.dropdown}>▼ Index: NIFTY50</Text>
        {/* <PieChart
          data={chartData.map(item => ({
            name: item.name,
            population: Math.abs(item.value), // Use absolute value for pie chart
            color: item.color,
            legendFontColor: '#FFF',
            legendFontSize: 14,
          }))}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#000',
            backgroundGradientFrom: '#000',
            backgroundGradientTo: '#000',
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => '#FFF',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
        /> */}
        {/* <Text style={styles.chartCenterText}>NIFTY 50{"\n"}145 pts</Text> */}
        <View style={styles.legend}>
          {/* {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.name}: {item.value}
              </Text>
            </View>
          ))} */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 1,
  },
  gradientBoxBorder: {
    borderRadius: 25,
    padding: 1,
    marginHorizontal: 5,
    flex: 1,
  },
  innerGradient: {
    borderRadius: 24,
    padding: 1,
  },
  innerContainer: {
    backgroundColor: '#000',
    borderRadius: 100,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
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
  coinText: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  iconMargin: {
    marginHorizontal: 5,
  },
  indexSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  indexCard: {
    // backgroundColor: '#000',
    padding: 15,
    borderRadius: 23,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  indexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  indexChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '600',
  },
  indexValue: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Questrial-Regular',
    fontWeight: 'bold',
  },
  indexChangePositive: {
    color: '#34C759',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  indexChangeNegative: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
  sliderSection: {
    marginBottom: 20,
  },
  sliderTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '600',
    marginBottom: 10,
  },
  slider: {
    alignItems: 'center',
  },
  sliderBar: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  callBar: {
    backgroundColor: '#007BFF',
  },
  putBar: {
    backgroundColor: '#333',
  },
  sliderLabelLeft: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Questrial-Regular',
    position: 'absolute',
    left: 0,
    top: 15,
  },
  sliderLabelRight: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Questrial-Regular',
    position: 'absolute',
    right: 0,
    top: 15,
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdown: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  chartCenterText: {
    position: 'absolute',
    top: 90,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Questrial-Regular',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Questrial-Regular',
    fontWeight: '500',
  },
});

export default Index;