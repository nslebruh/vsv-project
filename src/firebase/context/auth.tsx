import firebaseApp from "../initFirebase";
import { createContext, useState, useEffect, useContext } from "react"
import { getAuth, } from "firebase/auth"

export const firebaseAuth = getAuth(firebaseApp)

const AuthContext = createContext<any | undefined>(undefined);

export const AuthProvider: React.FC<any> = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const value = { user };
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
    
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuthProvider = () => {
  const context = useContext<any>(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within a AuthProvider"
    );
  }
  return context.user;
}