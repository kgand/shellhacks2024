import { registerWithEmailandPassword } from "@/utils/auth";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function Register() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    return (
        <View>
            <TextInput placeholder="Email" onChangeText={n => setEmail(n)} />
            <TextInput placeholder="Password" secureTextEntry onChangeText={(n => setPassword(n))} />

            <Button title="Sign In" onPress={() => registerWithEmailandPassword(email, password)} />
            
        </View>
    );
}