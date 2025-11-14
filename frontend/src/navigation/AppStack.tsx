import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../pages/Home";

export type AppStackParamList = {
  Home: undefined;
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
    </Stack.Navigator>
  );
}
