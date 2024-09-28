import Menu from "@/components/Menu";
import { SafeAreaView } from "react-native";

export default function Home() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Menu />
        </SafeAreaView>
    );
}