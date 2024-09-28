import { initializeApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
//@ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
//@ts-check

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export { app, auth };