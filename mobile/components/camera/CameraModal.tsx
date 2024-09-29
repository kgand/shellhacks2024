import { Modal, SafeAreaView, View } from "react-native";
import ARCamera from "./ARCamera";

interface Props {
    visible: boolean,
    onClose: () => void
}

export default function CameraModal({visible, onClose}: Props) {
  return (
    <Modal visible={visible} animationType="slide">
        <ARCamera onClose={onClose} />
    </Modal>
  );
}
