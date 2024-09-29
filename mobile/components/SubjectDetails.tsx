import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '@/configs/firebase';

interface Note {
  id: string;
  subjectId: string;
  content: string;
  createdAt: string;
  imageData?: string;
}

const SubjectDetails: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { subject } = route.params;
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
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

  const renderNoteItem = ({ item }: { item: Note }) => {
    return (
      <View style={tw`mb-4 bg-neutral-700 rounded-lg shadow-md overflow-hidden`}>
        {item.imageData && (
          <Image
            style={tw`w-full h-128`}
            source={{ uri: `data:image/png;base64,${item.imageData}` }}
            resizeMode="contain"
          />
        )}
        {item.content && (
          <Text style={tw`p-4 text-base text-white`}>{item.content}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-neutral-900`}>
      <View style={tw`px-6 pt-8 pb-4 bg-black flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={tw`ml-4 text-2xl font-bold text-white`}>{subject.name}</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" style={tw`mt-8`} />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw`px-6 py-4`}
          ListEmptyComponent={
            <Text style={tw`text-center text-neutral-400 italic`}>
              No notes available for this subject.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SubjectDetails;