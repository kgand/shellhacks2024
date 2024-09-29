import { Modal, SafeAreaView, View } from "react-native";
import ARCamera from "./ARCamera";

export default function CameraModal() {
  return (
    <Modal visible={true} animationType="slide">
        <ARCamera />
    </Modal>
  );
}
