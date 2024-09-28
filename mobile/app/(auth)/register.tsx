import Card from "@/components/register/Card";
import { registerWithEmailandPassword } from "@/utils/auth";
import { useState } from "react";
import { Keyboard, Text, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Register() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 w-screen bg-neutral-900 flex justify-center items-center">
        <Toast onPress={Toast.hide} />
        <Card />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
