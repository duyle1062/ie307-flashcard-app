import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import UserProfile from "../screens/UserProfile";
import Study from "../screens/Study";
import ViewAllCards from "../screens/ViewAllCards";
import { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        headerShown: false,
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="Study" component={Study} />
      <Stack.Screen name="ViewAllCards" component={ViewAllCards} />
    </Stack.Navigator>
  );
}
