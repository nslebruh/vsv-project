import {
  ref,
} from "firebase/database"
import { firebaseDB } from "../../firebase/context/database"

export const getRef = (url?: string) => {
  return url !== undefined ? ref(firebaseDB, url) : ref(firebaseDB);
}