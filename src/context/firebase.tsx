import { createContext, useEffect, useState, useContext } from "react"
import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword,  } from "firebase/auth"
import { getDatabase, ref, set } from "firebase/database"

const config = {
  apiKey: "AIzaSyBDK0n1WIWcU6h-_OrmtqvAY1acBRS7fHg",
  authDomain: "clompass-chat-app.firebaseapp.com",
  projectId: "clompass-chat-app",
  storageBucket: "clompass-chat-app.appspot.com",
  messagingSenderId: "319826122916",
  appId: "1:319826122916:web:44bf4e1bc13acdc8b4ae31"
}

const firebase = initializeApp(config)
const auth = getAuth(firebase)
const db = getDatabase(firebase, "https://clompass-chat-app-default-rtdb.asia-southeast1.firebasedatabase.app")

const DbContext = createContext<any | undefined>(undefined)
const AuthContext = createContext<any | undefined>(undefined);

const DbProvider: React.FC<any> = ({children}: any) => {
  const database = db
  return (
    <DbContext.Provider value={database}>
      {children}
    </DbContext.Provider>
  )
}
function useDb() {
  const context = useContext<any>(DbContext);
  if (context === undefined) {
    throw new Error(
      "useDb must be used within a DbProvider"
    );
  }
  return context.user;

}
const getRef = (url: string) => {
  return ref(db, url)
}

const AuthProvider: React.FC<any> = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const value = { user };
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
  
function useUserAuth() {
  const context = useContext<any>(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within a AuthProvider"
    );
  }
  return context.user;
}
const useAuth = () => {
  return auth
}
const signUpUser = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential: UserCredential) => {
      // Sign up successful. 
      const user = userCredential.user
      console.log(user)
      const userRef = getRef(`/users/${user.uid}`);
      set(userRef, {
        name: user.email,
        uid: user.uid,
        channels: {
          "root": true 
        }
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}
const signInUser = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Sign in sucessful.
      const user = userCredential.user
      console.log("user:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}
const signOutUser = () => {
  auth.signOut()
    .then(() => {
      // Sign out successful.
    }
    ).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    }
    );
}

export { AuthProvider, useAuth, useUserAuth, DbProvider, useDb, getRef, signUpUser, signInUser, signOutUser };