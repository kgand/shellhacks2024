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
  Alert,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import CreateNoteModal from './CreateNoteModal';
import ARCamera from './ARCamera';
import { auth } from '@/configs/firebase';
import { appSignOut } from '@/utils/auth';
import AnimatedBackground from './AnimatedBackground';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const insets = useSafeAreaInsets();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);


  useEffect(() => {
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchQuery, subjects]);

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
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subjects and notes',
      });
      setSubjects([]);
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
      console.log('Fetched Notes Data:', data); // Log the entire response data

      // Process the note_list to create Note objects
      const notesArray = data.note_list.map((base64Image: string, index: number) => ({
        id: `${subject.id}-${index}`,
        subjectId: subject.id,
        content: '', // Placeholder content
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

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim() === '') return;

    setIsSearching(true);

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout for 5 seconds
    const timeout = setTimeout(() => {
      if (isSearching) {
        Alert.alert(
          'Timeout',
          'The search request timed out. Please try again.',
          [
            { text: 'Retry', onPress: handleSearch },
            { text: 'Cancel', style: 'cancel', onPress: () => setIsSearching(false) },
          ]
        );
      }
    }, 5000);
    setSearchTimeout(timeout);

    try {
      const response = await fetch('http://10.108.74.57:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: searchQuery, userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const filtered = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } catch (error) {
      console.error('Error searching subjects:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to search subjects',
      });
    } finally {
      setIsSearching(false);
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    }
  }, [searchQuery, userId, isSearching, searchTimeout]);

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
              height: 500, // Increased height for fuller display
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
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header with Logo and Sign Out */}
      <View style={tw`px-6 py-4 bg-black flex-row justify-between items-center z-20`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('@/assets/logo.png')} // Ensure the logo image is placed correctly in assets
            style={tw`w-10 h-10 mr-2`}
          />
          <Text style={tw`text-2xl font-bold text-white`}>Noted.</Text>
        </View>
        <TouchableOpacity
          style={tw`flex-row items-center bg-neutral-800 rounded-full px-4 py-2`}
          onPress={handleSignOut}
        >
          <Text style={tw`text-white text-sm mr-2`}>{auth.currentUser?.email}</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={tw`px-6 py-2 bg-neutral-800 z-20`}>
        <View style={tw`flex-row items-center bg-neutral-700 rounded-lg px-4`}>
          <TextInput
            style={tw`flex-1 py-3 text-white text-lg`}
            placeholder="Search notes"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} disabled={isSearching}>
            <Ionicons name="search" size={24} color={isSearching ? 'gray' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* FlatList for Subjects and Notes */}
      <FlatList
        data={selectedSubject ? notes : filteredSubjects}
        renderItem={selectedSubject ? renderNoteItem : renderSubjectItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {isSearching && (
              <View style={tw`flex-1 justify-center items-center my-4 z-20`}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
            {selectedSubject ? (
              <>
                <TouchableOpacity
                  style={tw`flex-row items-center mb-4 z-20`}
                  onPress={() => setSelectedSubject(null)}
                >
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                  <Text style={tw`ml-2 text-lg font-semibold text-white`}>Back to Subjects</Text>
                </TouchableOpacity>
                <Text style={tw`text-2xl font-bold text-white mb-4 z-20`}>{selectedSubject.name}</Text>
              </>
            ) : (
              <Text style={tw`text-3xl font-bold text-white mb-6 z-20`}>Your Subjects</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <Text style={tw`text-center text-neutral-400 italic z-20`}>
            {selectedSubject ? 'No notes for this subject yet.' : "No subjects available. Let's add some!"}
          </Text>
        }
        contentContainerStyle={tw`px-6 py-4 z-20`}
      />

      {/* Create Note Button */}
      <TouchableOpacity
        style={tw`absolute bottom-20 right-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleCreateNewNote}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Open Camera Button */}
      <TouchableOpacity
        style={tw`absolute bottom-20 left-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleOpenCamera}
      >
        <Ionicons name="camera" size={28} color="white" />
      </TouchableOpacity>

      {/* Create Note Modal */}
      <CreateNoteModal
        isVisible={isSketchModalVisible}
        onClose={() => setIsSketchModalVisible(false)}
        subjectId={selectedSubject?.id || null}
        onNoteCreated={handleNoteCreated}
        userId={userId}
      />

      {/* AR Camera Modal */}
      <Modal
        visible={isCameraModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCameraModalVisible(false)}
        transparent={false} // Ensure modal covers the screen
      >
        <ARCamera onClose={() => setIsCameraModalVisible(false)} />
      </Modal>

      {/* Loading Indicator */}
      {isLoading && !isSearching && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center z-30`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};


export default Menu;