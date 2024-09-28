import { auth } from "@/configs/firebase";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const response = await signInWithEmailAndPassword(auth, email, password);

        // Check whether user has classes with API (to do)
        // Then push into home or onboarding conditionally

        return { user: auth.currentUser };
      } catch (e) {
        return { error: e };
      }
}

export const registerWithEmailandPassword = async (email: string, password: string) => {
    try {
        const response = await createUserWithEmailAndPassword(auth, email, password);

        router.replace('/(extra)/onboarding')

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