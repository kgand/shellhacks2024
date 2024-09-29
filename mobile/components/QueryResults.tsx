import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '@/configs/firebase'; // Ensure this import is correct
import { appSignOut } from '@/utils/auth';

interface Note {
  id: string;
  imageData: string;
}

const QueryResults: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { matchedNotes } = route.params;
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
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-neutral-900 pt-6`}>
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
          onPress={async () => {
            await appSignOut();
          }}
        >
          <Text style={tw`text-white text-sm mr-2`}>{auth.currentUser?.email}</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View style={tw`px-6 py-4 bg-black flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={tw`ml-4 text-2xl font-bold text-white`}>Note Finding LLM Results</Text>
      </View>
      <FlatList
        data={matchedNotes.map((base64Image: string, index: number) => ({
          id: `matched-${index}`,
          imageData: base64Image,
        }))}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`px-6 py-4`}
        ListEmptyComponent={
          <Text style={tw`text-center text-neutral-400 italic`}>
            No matching notes found.
          </Text>
        }
      />
    </View>
  );
};

export default QueryResults;