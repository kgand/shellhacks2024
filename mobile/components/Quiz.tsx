import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { auth } from '@/configs/firebase';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { appSignOut } from '@/utils/auth';

interface QuizProps {
  subjectId: string;
}

interface Question {
  id: string;
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

const Quiz: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { subjectId } = route.params;
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://10.108.74.57:5000/api/quiz', {
        userId: auth.currentUser?.uid,
        subject: subjectId
      });

      // Access the quiz data from the response
      const quizData = response.data;
      console.log('Quiz data:', JSON.stringify(quizData, null, 2));

      if (quizData.error) {
        throw new Error(quizData.error);
      }

      setQuestions(quizData.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load quiz questions',
      });
      navigation.goBack(); // Navigate back to the menu
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      setQuizCompleted(true);
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) {
      console.log('No question available at index:', currentQuestionIndex);
      return null;
    }

    console.log('Rendering question:', JSON.stringify(question, null, 2));

    return (
      <View style={tw`p-4`}>
        <Text style={tw`text-white text-xl font-bold mb-6`}>{question.text}</Text>
        {question.options && Object.entries(question.options).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={tw`bg-neutral-700 px-4 py-3 rounded-lg mb-3 ${selectedAnswer === key ? 'bg-indigo-600' : ''}`}
            onPress={() => handleAnswerSelect(key)}
          >
            <Text style={tw`text-white text-lg`}>{key.toUpperCase()}. {value}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={tw`bg-indigo-600 px-4 py-3 rounded-lg mt-6`}
          onPress={handleNextQuestion}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>Next Question</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuizResults = () => (
    <View style={tw`p-4 items-center`}>
      <Text style={tw`text-white text-2xl mb-4`}>Quiz Completed!</Text>
      <Text style={tw`text-white text-lg mb-4`}>Your score: {score}/{questions.length}</Text>
      <TouchableOpacity
        style={tw`bg-indigo-600 px-4 py-2 rounded-lg`}
        onPress={() => navigation.goBack()}
      >
        <Text style={tw`text-white text-center font-bold`}>Back to Subjects</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-neutral-900 pt-6`}>
      <View style={tw`px-6 py-4 bg-black flex-row justify-between items-center z-20`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-4`}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={tw`flex-row items-center flex-1`}>
          <Image
            source={require('@/assets/logo.png')}
            style={tw`w-10 h-10 mr-.5`}
          />
          <Text style={tw`text-2xl mt-2 font-bold text-white`}>otion</Text>
        </View>
        <TouchableOpacity
          style={tw`flex-row items-center bg-red-500 rounded-full px-4 py-2`}
          onPress={async () => {
            await appSignOut();
          }}
        >
          <Text style={tw`text-white text-sm mr-2`}>{auth.currentUser?.email}</Text>
          <Ionicons name="log-out-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1`}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffffff" style={tw`mt-8`} />
        ) : quizCompleted ? (
          renderQuizResults()
        ) : (
          renderQuestion()
        )}
      </ScrollView>
    </View>
  );
};

export default Quiz;