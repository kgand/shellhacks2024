import React from 'react';
import Card from "@/components/register/Card";
import { Keyboard, TouchableWithoutFeedback, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Register: React.FC = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <View style={{ flex: 1 }}>
          <Toast onPress={Toast.hide} />
          <Card />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

export default Register;