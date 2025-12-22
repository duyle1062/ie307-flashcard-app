import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import UserProfile from "../screens/UserProfile";
import ChangePassword from "../screens/ChangePassword";
import Study from "../screens/Study";
import ViewAllCards from "../screens/ViewAllCards";
import OCRCardCreator from "../screens/OCRCardCreator";
import VisionOCRCardCreator from "../screens/VisionOCRCardCreator";
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
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="Study" component={Study} />
      <Stack.Screen name="ViewAllCards" component={ViewAllCards} />
      <Stack.Screen name="OCRCardCreator" component={OCRCardCreator} />
      <Stack.Screen name="VisionOCRCardCreator" component={VisionOCRCardCreator} />
    </Stack.Navigator>
  );
}
