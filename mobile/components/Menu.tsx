import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);

  const fetchSubjectsAndNotes = async () => {
    try {
      const response = await axios.get('http://your-flask-api-url/subjects');
      setSubjects(response.data.subjects);
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <View>
      <Text>Menu Screen</Text>
      {subjects.map((subject) => (
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
    </View>
  );
};

export default Menu;
