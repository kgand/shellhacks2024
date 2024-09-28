import { auth } from "@/configs/firebase";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { checkServer } from "./network";

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
        const check = await checkServer();

        if (!check) throw Error("Cannot reach server");

        const response = await createUserWithEmailAndPassword(auth, email, password);
        const userId = auth.currentUser?.uid;

        // Send a request to your MongoDB endpoint to create a user
        await fetch('http://10.108.74.57:5000/api/create_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId
            }),
        });

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