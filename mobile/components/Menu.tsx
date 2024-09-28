import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import CreateNoteModal from './CreateNoteModal';
import { useNavigation } from '@react-navigation/native';
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
}

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
      const response = await axios.get('http://your-flask-api-url/subjects');
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

  const handleSignOut = async () => {
    await appSignOut();
    navigation.navigate('Login' as never);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    setIsSearching(true);
    try {
      const response = await axios.post('http://10.108.164.65:5000/search', { query: searchQuery });
      setNotes(response.data.notes);
      setFilteredSubjects(response.data.subjects);
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
      <Text style={tw`text-base text-white`}>{item.content}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={[tw`flex-1 bg-neutral-900`, { paddingTop: insets.top }]}>
      <View style={tw`px-6 py-8 bg-black flex-row justify-between items-center`}>
        <View style={tw`flex-1`}>
          <Text style={tw`text-3xl font-bold text-white`}>Noted.</Text>
        </View>
        <View style={tw`flex-1 items-center`}>
          <Text style={tw`text-white text-lg`}>{auth.currentUser?.email}</Text>
        </View>
        <View style={tw`flex-1 items-end`}>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
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
            <Ionicons name="search" size={28} color="white" />
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
        style={tw`absolute bottom-10 right-10 bg-indigo-600 p-5 rounded-full shadow-lg flex-row items-center`}
        onPress={handleCreateNewNote}
      >
        <AntDesign name="edit" size={28} color="white" />
        <Text style={tw`text-white font-semibold ml-3 text-lg`}>New Note</Text>
      </TouchableOpacity>

      <CreateNoteModal
        isVisible={isSketchModalVisible}
        onClose={() => setIsSketchModalVisible(false)}
        subjectId={selectedSubject?.id || null}
        onNoteCreated={handleNoteCreated}
      />

      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};


export default Menu;