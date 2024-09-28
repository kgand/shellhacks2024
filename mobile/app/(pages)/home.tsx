import { auth } from "@/configs/firebase";
import { appSignOut } from "@/utils/auth";
import { Button, SafeAreaView, Text, View } from "react-native";

export default function Home() {
    return (
        <SafeAreaView>
            <Text>You are logged in!</Text>
            <Text>Logged in as {auth.currentUser?.email}</Text>
            <Text>ID: {auth.currentUser?.uid}</Text>
            <Button title="Sign Out" onPress={appSignOut} />
        </SafeAreaView>
    );
}