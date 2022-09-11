import { firebaseAuth as auth } from "../context/auth";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth"
import { getRef } from "./database";
import { DataSnapshot, get, set } from "firebase/database";


export const signUpUser = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential: UserCredential) => {
      // Sign up successful. 
      const user = userCredential.user
      console.log(user)
      const newUser = {
        name: user.displayName || user.email,
        channels: {
          "root": true
        }
      }
      const reference = getRef(`/users/${user.uid}`)
      set(reference, newUser)
        .then((value) => {
          console.log(value)
        })
        .catch((err) => {
          console.log(err)
        })
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
      const checkForRootChannel = () => {
        const reference = getRef(`/users/${user.uid}/channels`)
        get(reference)
          .then((value: DataSnapshot) => {
            if (!value.hasChild("root")) {
              set(reference, {"root": true})
                .then((val) => {
                  console.log(val)
                })
                .catch((err) => {
                  console.log(err)
                })
            }
          })
      }
      console.log("user:", user);
      checkForRootChannel()
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