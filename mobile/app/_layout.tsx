import { AuthProvider } from "@/contexts/AuthProvider";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
