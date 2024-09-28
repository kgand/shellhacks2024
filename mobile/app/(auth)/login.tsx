import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Login() {
    return (
        <View>
            <Text>Log in here</Text>
            <Button title="Go to Register" onPress={() => router.push('/(auth)/register')} />
        </View>
    );
}