import { loginWithEmailAndPassword } from "@/utils/auth";
import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Card() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const onSubmit = async () => {

    const { error } = await loginWithEmailAndPassword(email, password);

    if (error) {
        Toast.show({
            type: 'error',
            text1: "An error has occurred"
        });
    }
  }
  return (
    <View className="w-[50%] aspect-[5/6] bg-black rounded-xl flex justify-center items-center py-10 px-5 space-y-6">
      <Text className="text-white font-bold text-4xl">Log In</Text>

      <View className="w-[80%] justify-center items-center space-y-4">
        <TextInput
          className="h-[19%] w-full px-3 border-2 border-neutral-800 focus:border-neutral-600 rounded-md text-white"
          placeholder="Email"
          value={email}
          onChangeText={n => setEmail(n)}
        />
        <TextInput
          className="h-[19%] mb-10 w-full px-3 border-2 border-neutral-800 focus:border-neutral-600 rounded-md text-white"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={n => setPassword(n)}
        />

        <TouchableOpacity onPress={onSubmit} className="w-full flex justify-center items-center bg-white h-[19%] rounded-xl">
          <Text className="text-black text-xl">Log in</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="p-2" onPress={() => router.push("/(auth)/register")}>
        <Text className="text-blue-500 underline">
          Don't have an account? Sign up.
        </Text>
      </TouchableOpacity>
    </View>
  );
}
