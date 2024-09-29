import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import CreateNoteModal from './CreateNoteModal';
import ARCamera from './ARCamera';
import { auth } from '@/configs/firebase';
import { appSignOut } from '@/utils/auth';
import { useNavigation } from '@react-navigation/native';

interface Subject {
  id: string;
  name: string;
}

interface Note {
  id: string;
  subjectId: string;
  content: string;
  createdAt: string;
  imageData?: string;
}

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState<boolean>(false);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState<boolean>(false);
  const [queryInput, setQueryInput] = useState<string>('');
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);


  const fetchSubjectsAndNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://10.108.74.57:5000/api/get_subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const classesArray = JSON.parse(data.classes.replace(/'/g, '"'));
      const subjectsArray = classesArray.map((className: string) => ({
        id: className,
        name: className,
      }));
      setSubjects(subjectsArray);
      setFilteredSubjects(subjectsArray);
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subjects and notes',
      });
      setSubjects([]);
      setFilteredSubjects([]);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectPress = async (subject: Subject) => {
    setSelectedSubject(subject);
    setIsLoading(true);
    try {
      const response = await fetch('http://10.108.74.57:5000/api/get_notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, class: subject.id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched Notes Data:', data);

      const notesArray = data.note_list.map((base64Image: string, index: number) => ({
        id: `${subject.id}-${index}`,
        subjectId: subject.id,
        content: '',
        createdAt: new Date().toISOString(),
        imageData: base64Image,
      }));

      setNotes(notesArray);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notes for this subject',
      });
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewNote = () => {
    setIsSketchModalVisible(true);
  };

  const handleNoteCreated = () => {
    fetchSubjectsAndNotes();
  };

  const handleSignOut = async () => {
    await appSignOut();
  };

  const handleQuery = useCallback(async () => {
    if (queryInput.trim() === '') return;

    setIsLoading(true);
    try {
      const response = await fetch('http://10.108.74.57:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, text: queryInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      navigation.navigate('QueryResults', { matchedNotes: data.matched_notes });
    } catch (error) {
      console.error('Error querying notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to query notes',
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryInput, userId, navigation]);

  const handleOpenCamera = () => {
    setIsCameraModalVisible(true);
  };

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={tw`mb-4 p-4 bg-neutral-800 rounded-lg shadow-md flex-row items-center`}
      onPress={() => handleSubjectPress(item)}
    >
      <Ionicons name="book-outline" size={24} color="#ffffff" />
      <Text style={tw`ml-3 text-lg font-semibold text-white`}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderNoteItem = ({ item }: { item: Note }) => {
    return (
      <View style={tw`mb-4 bg-neutral-700 rounded-lg shadow-md`}>
        {item.imageData && (
          <Image
            style={{
              width: '100%',
              height: 500,
              resizeMode: 'contain',
            }}
            source={{ uri: `data:image/png;base64,${item.imageData}` }}
          />
        )}
        {item.content && (
          <Text style={tw`p-4 text-base text-white`}>{item.content}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={[tw`flex-1 bg-neutral-900`, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={tw`px-6 py-4 bg-black flex-row justify-between items-center z-20`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('@/assets/logo.png')}
            style={tw`w-10 h-10 mr-.5`}
          />
          <Text style={tw`text-2xl mt-2 font-bold text-white`}>otion</Text>
        </View>
        <TouchableOpacity
          style={tw`flex-row items-center bg-neutral-800 rounded-full px-4 py-2`}
          onPress={handleSignOut}
        >
          <Text style={tw`text-white text-sm mr-2`}>{auth.currentUser?.email}</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={tw`px-6 py-2 bg-neutral-800 z-20`}>
        <View style={tw`flex-row items-center bg-neutral-700 rounded-lg px-4`}>
          <TextInput
            style={tw`flex-1 py-3 text-white text-lg`}
            placeholder="Ask a question based on your notes"
            placeholderTextColor="#999"
            value={queryInput}
            onChangeText={setQueryInput}
            onSubmitEditing={handleQuery}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleQuery}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={selectedSubject ? notes : filteredSubjects}
        renderItem={selectedSubject ? renderNoteItem : renderSubjectItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {selectedSubject && (
              <TouchableOpacity
                style={tw`flex-row items-center mb-4 z-20`}
                onPress={() => {
                  setSelectedSubject(null);
                  setQueryInput('');
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
                <Text style={tw`ml-2 text-lg font-semibold text-white`}>Back to Subjects</Text>
              </TouchableOpacity>
            )}
            {selectedSubject && (
              <Text style={tw`text-2xl font-bold text-white mb-4 z-20`}>{selectedSubject.name}</Text>
            )}
            {!selectedSubject && (
              <Text style={tw`text-3xl font-bold text-white mb-6 z-20`}>Your Subjects</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <Text style={tw`text-center text-neutral-400 italic z-20`}>
            {selectedSubject ? 'No notes for this subject yet.' : 'No subjects available.'}
          </Text>
        }
        contentContainerStyle={tw`px-6 py-4 z-20`}
      />

      {!selectedSubject && (
        <TouchableOpacity
          style={tw`absolute bottom-20 right-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
          onPress={handleCreateNewNote}
        >
          <AntDesign name="plus" size={28} color="white" />
        </TouchableOpacity>
      )}

      {!selectedSubject && (
        <TouchableOpacity
          style={tw`absolute bottom-20 left-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
          onPress={handleOpenCamera}
        >
          <Ionicons name="camera" size={28} color="white" />
        </TouchableOpacity>
      )}

      <CreateNoteModal
        isVisible={isSketchModalVisible}
        onClose={() => setIsSketchModalVisible(false)}
        subjectId={selectedSubject?.id || null}
        onNoteCreated={handleNoteCreated}
        userId={userId}
      />

      <Modal
        visible={isCameraModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCameraModalVisible(false)}
        transparent={false}
      >
        <ARCamera onClose={() => setIsCameraModalVisible(false)} />
      </Modal>

      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-30`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};

export default Menu;