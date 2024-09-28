import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { auth } from '@/configs/firebase';
import Toast from 'react-native-toast-message';

interface ReadProps {
  subjectId: string;
}

const Read: React.FC<ReadProps> = ({ subjectId }) => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      const response = await axios.get('http://10.108.74.57:5000/api/get_notes', {
        params: { userId, subjectId },
        responseType: 'blob',  // Fetches the PDF as a binary blob
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);  // Create a temporary URL for the PDF
      setPdfUrl(pdfUrl);  // Set the URL for the PDF
    } catch (error) {
      console.error('Error fetching notes:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPdf = async () => {
    if (pdfUrl) {
      try {
        await Linking.openURL(pdfUrl);  // Open the PDF in the default PDF viewer
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to open PDF',
        });
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a question',
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      const response = await axios.post('http://10.108.74.57:5000/send_question', {
        userId,
        subjectId,
        question,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error asking question:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to get an answer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={tw`flex-1 bg-neutral-900 p-4`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>Course Notes</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" style={tw`mt-8`} />
      ) : pdfUrl ? (
        <View style={tw`mb-8`}>
          <Text style={tw`text-white text-lg mb-4`}>Notes are available as a PDF:</Text>
          <TouchableOpacity
            style={tw`bg-indigo-600 px-4 py-2 rounded-lg`}
            onPress={handleOpenPdf}
          >
            <Text style={tw`text-white text-center font-bold`}>Open PDF</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={tw`text-white text-lg mb-4`}>No notes available</Text>
      )}

      <Text style={tw`text-white text-xl font-bold mb-4`}>Ask a Question</Text>
      <TextInput
        style={tw`bg-neutral-700 text-white px-4 py-2 rounded-lg mb-4`}
        value={question}
        onChangeText={setQuestion}
        placeholder="Enter your question here"
        placeholderTextColor="#999"
        multiline
      />
      <TouchableOpacity
        style={tw`bg-indigo-600 px-4 py-2 rounded-lg mb-4`}
        onPress={handleAskQuestion}
      >
        <Text style={tw`text-white text-center font-bold`}>Ask</Text>
      </TouchableOpacity>

      {answer && (
        <View style={tw`mt-4`}>
          <Text style={tw`text-white text-xl font-bold mb-2`}>Answer:</Text>
          <Text style={tw`text-white text-lg`}>{answer}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Read;
