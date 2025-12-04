import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";

export type AppStackParamList = {
  Home: undefined;
  UserProfile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        statusBarStyle: "dark",
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
}
