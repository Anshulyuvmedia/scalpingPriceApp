// app/(root)/(drawer)/_layout.jsx
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text } from 'react-native';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <Text style={{ padding: 20, fontSize: 18, fontWeight: 'bold' }}>Wealth Walk</Text>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: { backgroundColor: '#f5f5f5', width: 240 },
          headerStyle: { backgroundColor: '#6200ea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          swipeEdgeWidth: 100,
        }}
      >
        <Drawer.Screen name="trendalerts" options={{ drawerLabel: 'Trend Alerts', title: 'Trend Alerts' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}