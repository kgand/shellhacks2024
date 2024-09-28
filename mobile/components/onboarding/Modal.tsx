import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { selectable } from "./Card";

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (entry: selectable) => void;
}

export default function AddModal({ visible, onClose, onAdd }: Props) {
  const [className, setClassName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>('Anthropology');

  const handleAdd = () => {
    if (className.trim()) {
      onAdd(
        {
          value: className.trim(),
          subject: selectedSubject,
          active: true
        }
      );
      setClassName("");
      onClose();
    }
  };

  console.log(selectedSubject);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={Keyboard.dismiss}
          className="flex-1 justify-center items-center bg-black/50"
        >
          <View className="bg-black w-[80%] max-w-[400px] aspect-[4/3] border-2 border-neutral-600 rounded-3xl p-6">
            <Text className="text-white font-semibold text-2xl mb-6 text-center">
              Add a Class
            </Text>
            <TextInput
              className="h-12 px-4 w-full border-[1px] border-neutral-600 rounded-lg placeholder:text-neutral-400 text-white mb-6"
              placeholder="Class name"
              placeholderTextColor="#9CA3AF"
              value={className}
              onChangeText={setClassName}
            />
            <View className="w-full flex items-center justify-center">
              <Text className="text-white text-lg mb-2">Select the subject</Text>
              <View className="h-[1px] w-full bg-neutral-600"></View>
            </View>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(v) => setSelectedSubject(v)}
              mode="dropdown"
            >
              <Picker.Item
                label="Anthropology"
                value="Anthropology"
                color="white"
              />
              <Picker.Item
                label="Art History"
                value="Art History"
                color="white"
              />
              <Picker.Item
                label="Biochemistry"
                value="Biochemistry"
                color="white"
              />
              <Picker.Item label="Biology" value="Biology" color="white" />
              <Picker.Item
                label="Business Administration"
                value="Business Administration"
                color="white"
              />
              <Picker.Item label="Chemistry" value="Chemistry" color="white" />
              <Picker.Item
                label="Civil Engineering"
                value="Civil Engineering"
                color="white"
              />
              <Picker.Item
                label="Communication Studies"
                value="Communication Studies"
                color="white"
              />
              <Picker.Item
                label="Computer Science"
                value="Computer Science"
                color="white"
              />
              <Picker.Item
                label="Criminal Justice"
                value="Criminal Justice"
                color="white"
              />
              <Picker.Item
                label="Data Science"
                value="Data Science"
                color="white"
              />
              <Picker.Item label="Economics" value="Economics" color="white" />
              <Picker.Item
                label="Electrical Engineering"
                value="Electrical Engineering"
                color="white"
              />
              <Picker.Item
                label="Environmental Science"
                value="Environmental Science"
                color="white"
              />
              <Picker.Item label="Fine Arts" value="Fine Arts" color="white" />
              <Picker.Item
                label="Game Design"
                value="Game Design"
                color="white"
              />
              <Picker.Item
                label="Graphic Design"
                value="Graphic Design"
                color="white"
              />
              <Picker.Item
                label="Health Sciences"
                value="Health Sciences"
                color="white"
              />
              <Picker.Item label="History" value="History" color="white" />
              <Picker.Item
                label="Humanities"
                value="Humanities"
                color="white"
              />
              <Picker.Item
                label="Information Technology"
                value="Information Technology"
                color="white"
              />
              <Picker.Item
                label="International Relations"
                value="International Relations"
                color="white"
              />
              <Picker.Item
                label="Literature"
                value="Literature"
                color="white"
              />
              <Picker.Item label="Marketing" value="Marketing" color="white" />
              <Picker.Item
                label="Mathematics"
                value="Mathematics"
                color="white"
              />
              <Picker.Item
                label="Mechanical Engineering"
                value="Mechanical Engineering"
                color="white"
              />
              <Picker.Item label="Music" value="Music" color="white" />
              <Picker.Item label="Nursing" value="Nursing" color="white" />
              <Picker.Item
                label="Philosophy"
                value="Philosophy"
                color="white"
              />
              <Picker.Item label="Physics" value="Physics" color="white" />
              <Picker.Item
                label="Political Science"
                value="Political Science"
                color="white"
              />
              <Picker.Item
                label="Psychology"
                value="Psychology"
                color="white"
              />
              <Picker.Item
                label="Social Science"
                value="Social Science"
                color="white"
              />
              <Picker.Item label="Sociology" value="Sociology" color="white" />
              <Picker.Item
                label="Statistics"
                value="Statistics"
                color="white"
              />
              <Picker.Item
                label="Theater Arts"
                value="Theater Arts"
                color="white"
              />
            </Picker>
            <View className="h-[1px] w-full bg-neutral-600 mb-4"></View>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={onClose}
                className="px-6 py-3 rounded-lg bg-neutral-700"
              >
                <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                className="px-6 py-3 rounded-lg bg-blue-600"
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
