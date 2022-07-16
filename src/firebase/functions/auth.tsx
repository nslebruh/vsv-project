import { firebaseAuth as auth } from "../context/auth";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth"


export const signUpUser = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential: UserCredential) => {
      // Sign up successful. 
      const user = userCredential.user
      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}
export const signInUser = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Sign in sucessful.
      const user = userCredential.user
      console.log("user:", user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error)
      console.log(errorCode, errorMessage);
    });
}
export const signOutUser = () => {
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