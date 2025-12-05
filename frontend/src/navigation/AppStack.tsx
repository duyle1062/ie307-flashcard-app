import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";
import Study from "../pages/Study";

export type AppStackParamList = {
  Home: undefined;
  Study: { deckId: string; title: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: "dark",
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Study" component={Study} />
    </Stack.Navigator>
  );
}
