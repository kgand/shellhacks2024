import Card from "@/components/login/Card";
import { router } from "expo-router";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Login() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 w-screen bg-neutral-900 flex justify-center items-center">
        <Toast onPress={Toast.hide} />
        <Card />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
