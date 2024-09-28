import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="register" />
            <Stack.Screen name="login" />
        </Stack>
    );
}