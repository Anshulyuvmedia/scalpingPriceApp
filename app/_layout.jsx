import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import './globals.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

function CustomDrawerContent(props) {
  const { navigation, state, descriptors, ...rest } = props;

  return (
    <DrawerContentScrollView {...props}>
      <Text style={{ padding: 20, fontSize: 18, fontWeight: 'bold' }}>
        Wealth Walk
      </Text>
      <DrawerItemList {...props} />
      {/* <DrawerItem
        label="Chatbot"
        onPress={() => {
          // console.log('Navigating to (tabs)/chatbot');
          navigation.navigate('(tabs)', { screen: 'chatbot' });
        }}
        labelStyle={{ fontSize: 16 }}
        style={{ backgroundColor: state.index === 1 ? '#e0e0e0' : 'transparent' }}
      /> */}

    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    console.log('Fonts not loaded yet');
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={props => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: {
              backgroundColor: '#f5f5f5',
              width: 240,
            },
            headerStyle: {
              backgroundColor: '#6200ea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            swipeEdgeWidth: 100,
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Home',
              title: 'Home',
            }}
          />
          <Drawer.Screen
            name="trendalerts"
            options={{
              drawerLabel: 'Trend Alerts',
              title: 'Trend Alerts',
            }}
          />
        </Drawer>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}