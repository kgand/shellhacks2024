import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Login() {
    return (
        <View>
            <Text className="text-purple-500 text-2xl">Log in here</Text>
            <Button title="Go to Register" onPress={() => router.push('/(auth)/register')} />
        </View>
    );
}