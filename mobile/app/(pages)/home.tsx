import Menu from "@/components/Menu";
import { SafeAreaView, StatusBar } from "react-native";

export default function Home() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor="black" barStyle="light-content" />
            <Menu />
        </SafeAreaView>
    );
}