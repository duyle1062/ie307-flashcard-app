import { useAuth } from "../shared/context/AuthContext";

import AuthStack from "./AuthStack";
import AppStack from "./AppStack";

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
