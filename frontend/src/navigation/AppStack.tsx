import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";
import Study from "../pages/Study";

export type AppStackParamList = {
  Home: undefined;
  Study: { deckId: string; title: string };
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
      <Stack.Screen name="Study" component={Study} />
    </Stack.Navigator>
  );
}
