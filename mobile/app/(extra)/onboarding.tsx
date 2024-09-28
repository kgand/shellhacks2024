import Card from "@/components/onboarding/Card";
import { SafeAreaView, StatusBar } from "react-native";

export default function Onboarding() {
    return (
        <SafeAreaView className="flex-1 w-full bg-black flex justify-center items-center">
            <StatusBar barStyle="light-content" backgroundColor="black" />
            <Card />
        </SafeAreaView>
    );
}