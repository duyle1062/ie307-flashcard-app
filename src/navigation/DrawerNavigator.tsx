import { createDrawerNavigator } from "@react-navigation/drawer";

import { Colors } from "../shared/constants/Color";

import Feather from "@expo/vector-icons/Feather";

import Home from "../screens/Home";
import Statistical from "../screens/Statistical";
import Setting from "../screens/Setting";
import DownloadExample from "../screens/DownloadExample";

import { DrawerParamList } from "./types";

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.subText,
        drawerStyle: { backgroundColor: Colors.background },
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.tertiary,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: "All Collections",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Statistical"
        component={Statistical}
        options={{
          title: "Statistical",
          drawerIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Setting"
        component={Setting}
        options={{
          title: "Setting",
          drawerIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="DownloadExample"
        component={DownloadExample}
        options={{
          title: "Download CSV example",
          drawerIcon: ({ color, size }) => (
            <Feather name="download" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
