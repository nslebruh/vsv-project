import { getDatabase } from "firebase/database"
import firebaseApp from "../initFirebase";
import { createContext, useContext } from "react"

export const firebaseDB = getDatabase(firebaseApp, "https://clompass-chat-app-default-rtdb.asia-southeast1.firebasedatabase.app")

const DBContext = createContext<any | undefined>(undefined);

export const DBProvider: React.FC<any> = ({children}: any) => {
  const database = firebaseDB
  return (
    <DBContext.Provider value={database}>
      {children}
    </DBContext.Provider>
  )
}
export const useDBContext = () => {
  const context = useContext<any>(DBContext);
  if (context === undefined) {
    throw new Error(
      "useDBContext must be used within a DBProvider"
    );
  }
  return context;
}
