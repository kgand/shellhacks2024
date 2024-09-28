import { auth } from "@/configs/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        return { user: auth.currentUser };
      } catch (e) {
        return { error: e };
      }
}

export const registerWithEmailandPassword = async (email: string, password: string) => {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password);
        return { user: auth.currentUser };
    } catch (e) {
        return { error: e };
    }
}

export const appSignOut = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        console.log(e);
    }
}