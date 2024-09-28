import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, TextInput, Image, Modal } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';
import CreateNoteModal from './CreateNoteModal';
import ARCamera from './ARCamera'; // Import ARCamera component
import { auth } from '@/configs/firebase';
import { appSignOut } from '@/utils/auth';

interface Subject {
  id: string;
  name: string;
}

interface Note {
  id: string;
  subjectId: string;
  content: string;
  createdAt: string;
}

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState<boolean>(false);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState<boolean>(false); // State for camera modal
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const userId = auth.currentUser?.uid; // Get the userId

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
      console.log('Data:', data);
      const classesArray = JSON.parse(data.classes.replace(/'/g, '"')); // Replace single quotes with double quotes
      const subjectsArray = classesArray.map((className: string) => ({ id: className, name: className }));
      setSubjects(subjectsArray); // Ensure subjects is always an array
      setNotes(data.notes || []); // Ensure notes is always an array
      console.log('Classes:', classesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load subjects and notes',
      });
      setSubjects([]); // Ensure subjects is always an array
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

  const handleSignOut = async () => {
    await appSignOut();
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    setIsSearching(true);
    try {
      const response = await fetch('http://10.108.74.57:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      setNotes(data.notes || []); // Ensure notes is always an array
      setFilteredSubjects(data.subjects || []); // Ensure subjects is always an array
    } catch (error) {
      console.error('Error searching:', error);
      Toast.show({
        type: 'error',
        text1: 'Search Failed',
        text2: 'There was an error processing your search.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenCamera = () => {
    setIsCameraModalVisible(true);
  };

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={tw`mb-4 p-4 bg-neutral-800 rounded-lg shadow-md flex-row items-center`}
      onPress={() => handleSubjectPress(item)}
    >
      <MaterialCommunityIcons name="book-open-variant" size={24} color="#ffffff" />
      <Text style={tw`ml-3 text-lg font-semibold text-white`}>{item.name}</Text>
    </TouchableOpacity>
  );


  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={tw`mb-4 p-4 bg-neutral-700 rounded-lg shadow-md`}>
      <Text style={tw`text-base text-white mb-2`}>{item.content}</Text>
      <Text style={tw`text-xs text-neutral-400`}>{new Date(item.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={[tw`flex-1 bg-neutral-900`, { paddingTop: insets.top }]}>
      <View style={tw`px-6 py-4 bg-black flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('@/assets/logo.png')}
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

      <View style={tw`px-6 py-4 bg-neutral-800`}>
        <View style={tw`flex-row items-center bg-neutral-700 rounded-lg px-4`}>
          <TextInput
            style={tw`flex-1 py-3 text-white text-lg`}
            placeholder="Search notes"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw`flex-1 px-6 py-6`}>
        {isSearching ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : selectedSubject ? (
          <>
            <TouchableOpacity
              style={tw`flex-row items-center mb-4`}
              onPress={() => setSelectedSubject(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
              <Text style={tw`ml-2 text-lg font-semibold text-white`}>Back to Subjects</Text>
            </TouchableOpacity>
            <Text style={tw`text-2xl font-bold text-white mb-4`}>{selectedSubject.name}</Text>
            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-neutral-400 italic`}>No notes for this subject yet</Text>
              }
            />
          </>
        ) : (
          <>
            <Text style={tw`text-3xl font-bold text-white mb-6`}>Your Subjects</Text>
            <FlatList
              data={filteredSubjects}
              renderItem={renderSubjectItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-neutral-400 italic text-lg`}>No subjects available. Let's add some!</Text>
              }
            />
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={tw`absolute bottom-10 right-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleCreateNewNote}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`absolute bottom-10 left-10 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleOpenCamera}
      >
        <Ionicons name="camera" size={28} color="white" />
      </TouchableOpacity>

      <CreateNoteModal
        isVisible={isSketchModalVisible}
        onClose={() => setIsSketchModalVisible(false)}
        subjectId={selectedSubject?.id || null}
        onNoteCreated={handleNoteCreated}
        userId={userId} // Pass userId as a prop
      />

      <Modal
        visible={isCameraModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCameraModalVisible(false)}
      >
        <ARCamera onClose={() => setIsCameraModalVisible(false)} />
      </Modal>

      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};


export default Menu;