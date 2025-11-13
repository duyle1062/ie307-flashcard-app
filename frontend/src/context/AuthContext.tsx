import { createContext, useContext, useState } from "react";
import { Alert } from "react-native";

type User = {
  email: string;
  password: string;
};

type AuthContextType = {
  email: string;
  isAuthenticated: boolean;
  users: User[];
  register: (email: string, password: string) => boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  const register = (inputEmail: string, inputPassword: string): boolean => {
    const userExists = users.some((u) => u.email === inputEmail);
    if (userExists) {
      Alert.alert("Email already registered", "Please use another email.");
      return false;
    }

    const newUser = { email: inputEmail, password: inputPassword };
    setUsers((current) => [...current, newUser]);

    return true;
  };

  const login = (inputEmail: string, inputPassword: string) => {
    const user = users.find(
      (u) => u.email === inputEmail && u.password === inputPassword
    );

    if (user) {
      setEmail(inputEmail);
      setIsAuthenticated(true);
      console.log("Login success:", inputEmail);
    } else {
      Alert.alert("Incorrect email or password");
    }
  };

  const logout = () => {
    setEmail("");
    setIsAuthenticated(false);
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider
      value={{ email, isAuthenticated, users, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
