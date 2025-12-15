import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import IndexPieChart from '@/components/IndexPieChart';
import HomeHeader from '@/components/HomeHeader';
import { router } from 'expo-router';
import CallPut from '../../../components/CallPut';
import { useIndex } from '@/contexts/IndexContext'; // Simplified import
import React, { useState, useEffect } from 'react';
import { useBroker } from '@/contexts/BrokerContext';

const Index = () => {
  const { indicesData, loading, error } = useIndex();
  const [niftyValue, setNiftyValue] = useState('18,245.32');
  const [sensexValue, setSensexValue] = useState('61,232.45');
  const [niftyChange, setNiftyChange] = useState('1.2%');
  const [sensexChange, setSensexChange] = useState('0.8%');
  const { isConnected, isLive } = useBroker();

  useEffect(() => {
    if (!loading && !error && indicesData) {
      const niftyData = indicesData['NIFTY 50'];
      const sensexData = indicesData['SENSEX'];
      // console.log('Nifty Data:', niftyData); // Debug log
      // console.log('Sensex Data:', sensexData); // Debug log

      if (niftyData) {
        const changeMatch = niftyData.change.match(/(-?\d+)/); // Extract numeric part
        const changeValue = changeMatch ? parseInt(changeMatch[0]) : 0;
        const baseValue = niftyData.baseValue || 18500; // Fallback to default
        setNiftyValue((baseValue + changeValue).toLocaleString());
        setNiftyChange(niftyData.change || '0 pts');
      }
      if (sensexData) {
        const changeMatch = sensexData.change.match(/(-?\d+)/); // Extract numeric part
        const changeValue = changeMatch ? parseInt(changeMatch[0]) : 0;
        const baseValue = sensexData.baseValue || 61500; // Fallback to default
        setSensexValue((baseValue + changeValue).toLocaleString());
        setSensexChange(sensexData.change || '0 pts');
      }
    }
  }, [indicesData, loading, error]);

  if (loading) return <View><Text style={{ color: '#FFF' }}>Loading...</Text></View>;
  if (error) return <View><Text style={{ color: '#FFF' }}>Error: {error}</Text></View>;

  return (
    <View style={styles.container}>
      <HomeHeader page={'home'} />
      {!isConnected && (
        <View style={styles.connectedBanner}>
          <TouchableOpacity style={styles.connectBtn} onPress={() => router.push('auth/BrokerConnection')}>
            <Text style={styles.connectTitle}>No Broker Connected</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* News and FX Signal Buttons */}
        <View style={styles.buttonRow}>
          <LinearGradient
            colors={['#000', '#AEAED4']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <TouchableOpacity style={styles.button} onPress={() => router.push('/news/NewsListing')}>
              <FontAwesome name="newspaper-o" size={22} color="#FFF" style={styles.iconMargin} />
              <Text style={styles.buttonText}>News</Text>
              <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#000', '#AEAED4']}
            start={{ x: 0.2, y: 1.2 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientBorder}
          >
            <TouchableOpacity style={styles.button} onPress={() => router.push('../tradealertscreens/tradealerts')}>
              <FontAwesome name="dollar" size={16} color="#FFF" style={styles.iconMargin} />
              <Text style={styles.buttonText}>FX Signal</Text>
              <Feather name="arrow-up-right" size={16} color="#FFF" style={styles.iconMargin} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* NIFTY 50 and Sensex Index Sections */}
        <View style={styles.indexSection}>
          <TouchableOpacity style={styles.indexBox} onPress={() => router.push('/stockdiscovery/searchdiscovery')}>
            <LinearGradient
              colors={['#000', '#AEAED4']}
              start={{ x: 0.3, y: 0.6 }}
              end={{ x: 0, y: 0 }}
              style={styles.gradientBoxBorder}
            >
              <LinearGradient
                colors={['#000', '#1A3B76']}
                start={{ x: 0.4, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerGradient}
              >
                <View style={styles.indexCard}>
                  <View style={styles.indexHeader}>
                    <Text style={styles.indexTitle}>Nifty 50</Text>
                    <View style={styles.indexChangeContainer}>
                      <Feather name={niftyChange.includes('-') ? "arrow-down-right" : "arrow-up-right"} size={16} color={niftyChange.includes('-') ? "#FF3B30" : "#34C759"} style={styles.iconMargin} />
                      <Text style={[styles.indexChangePositive, niftyChange.includes('-') && styles.indexChangeNegative]}>{niftyChange}</Text>
                    </View>
                  </View>
                  <MaskedView
                    maskElement={<Text style={styles.indexValue}>{niftyValue}</Text>}
                  >
                    <LinearGradient
                      colors={['#C6DBF8', '#609DF9']}
                      start={{ x: 1, y: 0.5 }}
                      end={{ x: 0, y: 0 }}
                    >
                      <Text style={[styles.indexValue, { opacity: 0 }]}>{niftyValue}</Text>
                    </LinearGradient>
                  </MaskedView>
                </View>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.indexBox}>
            <LinearGradient
              colors={['#000', '#AEAED4']}
              start={{ x: 0.3, y: 0.6 }}
              end={{ x: 0, y: 0 }}
              style={styles.gradientBoxBorder}
            >
              <LinearGradient
                colors={['#000', '#7A2C3F']}
                start={{ x: 1, y: 0 }}
                end={{ x: 1.5, y: 1 }}
                style={styles.innerGradient}
              >
                <View style={styles.indexCard}>
                  <View style={styles.indexHeader}>
                    <Text style={styles.indexTitle}>Sensex</Text>
                    <View style={styles.indexChangeContainer}>
                      <Feather name={sensexChange.includes('-') ? "arrow-down-right" : "arrow-up-right"} size={16} color={sensexChange.includes('-') ? "#FF3B30" : "#34C759"} style={styles.iconMargin} />
                      <Text style={[styles.indexChangePositive, sensexChange.includes('-') && styles.indexChangeNegative]}>{sensexChange}</Text>
                    </View>
                  </View>
                  <MaskedView
                    maskElement={<Text style={styles.indexValue}>{sensexValue}</Text>}
                  >
                    <LinearGradient
                      colors={['#F3DF65', '#FF5D57']}
                      start={{ x: 1, y: 0.5 }}
                      end={{ x: 0, y: 0 }}
                    >
                      <Text style={[styles.indexValue, { opacity: 0 }]}>{sensexValue}</Text>
                    </LinearGradient>
                  </MaskedView>
                </View>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <IndexPieChart />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    paddingBottom: 0,
  },
  connectedBanner: {
    backgroundColor: 'red',
    borderRadius: 5,
    marginBottom: 10,
  },
  connectTitle: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingHorizontal: 40,
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
  indexBox: {
    width: '50%',
  },
  indexCard: {
    padding: 15,
    paddingBottom: 50,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1A3B76',
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
    fontSize: 12,
    fontFamily: 'Questrial-Regular',
    fontWeight: '600',
  },
  indexValue: {
    textAlign: 'start',
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Questrial-Regular',
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
});

export default Index;