import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { auth } from '@/configs/firebase'; // Ensure this import is correct

const Query: React.FC = () => {
  const [queryInput, setQueryInput] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [matchedNotes, setMatchedNotes] = useState<string[]>([]);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  const handleQuery = useCallback(async () => {
    if (queryInput.trim() === '') return;

    setIsQuerying(true);

    try {
      const response = await fetch('http://10.108.74.57:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId, text: queryInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatchedNotes(data.matched_notes);
    } catch (error) {
      console.error('Error querying notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to query notes',
      });
    } finally {
      setIsQuerying(false);
    }
  }, [queryInput, userId]);

  const renderNoteItem = ({ item }: { item: string }) => {
    return (
      <View style={tw`mb-4 bg-neutral-700 rounded-lg shadow-md`}>
        <Image
          style={{
            width: '100%',
            height: 500,
            resizeMode: 'contain',
          }}
          source={{ uri: `data:image/png;base64,${item}` }}
        />
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-neutral-900`}>
      <View style={tw`px-6 py-4 bg-black flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={tw`ml-4 text-2xl font-bold text-white`}>Query Notes</Text>
      </View>
      <View style={tw`px-6 py-2 bg-neutral-800`}>
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
          <TouchableOpacity onPress={handleQuery} disabled={isQuerying}>
            <Ionicons name="send" size={24} color={isQuerying ? 'gray' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>
      {isQuerying && (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
      {!isQuerying && matchedNotes.length > 0 && (
        <FlatList
          data={matchedNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item, index) => `matched-${index}`}
          contentContainerStyle={tw`px-6 py-4`}
          ListEmptyComponent={
            <Text style={tw`text-center text-neutral-400 italic`}>
              No matching notes found.
            </Text>
          }
        />
      )}
    </View>
  );
};

export default Query;