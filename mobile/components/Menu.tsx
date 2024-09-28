import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);

  const fetchSubjectsAndNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://your-flask-api-url/subjects');
      setSubjects(response.data.subjects);
      setNotes(response.data.notes);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subjects and notes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text>Menu Screen</Text>
      {isLoading ? <ActivityIndicator size="large" /> : subjects.map((subject) => (
        <TouchableOpacity key={subject.id}>
          <Text>{subject.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Text>Create New Note</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <View>
          <Text>Sketch Modal</Text>
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

export default Menu;
