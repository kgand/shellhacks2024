import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import CreateNoteModal from './CreateNoteModal';
import { useNavigation } from '@react-navigation/native'; // Ensure this import is present

interface Subject {
  id: string;
  name: string;
}

interface Note {
  id: string;
  subjectId: string;
  content: string;
}

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState<boolean>(false);

  const navigation = useNavigation(); // Ensure this line is present
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);

  const fetchSubjectsAndNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://10.108.164.65:5000/subjects');
      setSubjects(response.data.subjects);
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subjects and notes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectPress = (subject: Subject) => {
    setSelectedSubject(subject);
    const subjectNotes = notes.filter(note => note.subjectId === subject.id);
    setNotes(subjectNotes);
  };

  const handleCreateNewNote = () => {
    setIsSketchModalVisible(true);
  };

  const handleNoteCreated = () => {
    fetchSubjectsAndNotes();
  };

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={tw`mb-4 p-4 bg-indigo-100 rounded-lg shadow-md flex-row items-center`}
      onPress={() => handleSubjectPress(item)}
    >
      <MaterialCommunityIcons name="book-open-variant" size={24} color="#4F46E5" />
      <Text style={tw`ml-3 text-lg font-semibold text-indigo-800`}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={tw`mb-4 p-4 bg-yellow-100 rounded-lg shadow-md`}>
      <Text style={tw`text-base text-yellow-800`}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1 bg-gray-100`, { paddingTop: insets.top }]}>
      <View style={tw`px-4 py-6 bg-indigo-600`}>
        <Text style={tw`text-3xl font-bold text-white`}>Noted.</Text>
        <Text style={tw`text-lg text-indigo-200`}>Your notes, your way.</Text>
      </View>

      <ScrollView style={tw`flex-1 px-4 py-6`}>
        {selectedSubject ? (
          <>
            <TouchableOpacity
              style={tw`flex-row items-center mb-4`}
              onPress={() => setSelectedSubject(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#4F46E5" />
              <Text style={tw`ml-2 text-lg font-semibold text-indigo-600`}>Back to Subjects</Text>
            </TouchableOpacity>
            <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>{selectedSubject.name}</Text>
            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 italic`}>No notes for this subject yet</Text>
              }
            />
          </>
        ) : (
          <>
            <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Your Subjects</Text>
            <FlatList
              data={subjects}
              renderItem={renderSubjectItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 italic`}>No subjects available. Let's add some!</Text>
              }
            />
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleCreateNewNote}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <CreateNoteModal
        isVisible={isSketchModalVisible}
        onClose={() => setIsSketchModalVisible(false)}
        subjectId={selectedSubject?.id || null}
        onNoteCreated={handleNoteCreated}
      />

      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
    </View>
  );
};

export default Menu;