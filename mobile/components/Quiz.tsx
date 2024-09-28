import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { auth } from '@/configs/firebase';
import Toast from 'react-native-toast-message';

interface QuizProps {
  subjectId: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

const Quiz: React.FC<QuizProps> = ({ subjectId }) => {
  const [questionType, setQuestionType] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      const response = await axios.get('http://10.108.74.57:5000/get_note_content', {
        params: { userId, subjectId, questionType, questionCount: parseInt(questionCount) }
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load questions',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (questionType && questionCount) {
      fetchQuestions();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select question type and count',
      });
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

  const renderQuizSetup = () => (
    <View style={tw`p-4`}>
      <Text style={tw`text-white text-lg mb-4`}>Select question type:</Text>
      <View style={tw`flex-row mb-4`}>
        <TouchableOpacity
          style={tw`bg-indigo-600 px-4 py-2 rounded-lg mr-2 ${questionType === 'mcq' ? 'opacity-100' : 'opacity-50'}`}
          onPress={() => setQuestionType('mcq')}
        >
          <Text style={tw`text-white`}>Multiple Choice</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`bg-indigo-600 px-4 py-2 rounded-lg ${questionType === 'openEnded' ? 'opacity-100' : 'opacity-50'}`}
          onPress={() => setQuestionType('openEnded')}
        >
          <Text style={tw`text-white`}>Open Ended</Text>
        </TouchableOpacity>
      </View>
      <Text style={tw`text-white text-lg mb-2`}>Number of questions:</Text>
      <TextInput
        style={tw`bg-neutral-700 text-white px-4 py-2 rounded-lg mb-4`}
        value={questionCount}
        onChangeText={setQuestionCount}
        keyboardType="numeric"
        placeholder="Enter number of questions"
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={tw`bg-green-600 px-4 py-2 rounded-lg`}
        onPress={handleStartQuiz}
      >
        <Text style={tw`text-white text-center font-bold`}>Start Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    return (
      <View style={tw`p-4`}>
        <Text style={tw`text-white text-lg mb-4`}>{question.text}</Text>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={tw`bg-neutral-700 px-4 py-2 rounded-lg mb-2 ${selectedAnswer === option ? 'bg-indigo-600' : ''}`}
            onPress={() => handleAnswerSelect(option)}
          >
            <Text style={tw`text-white`}>{option}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={tw`bg-green-600 px-4 py-2 rounded-lg mt-4`}
          onPress={handleNextQuestion}
        >
          <Text style={tw`text-white text-center font-bold`}>Next Question</Text>
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
        onPress={() => {
          setQuestions([]);
          setCurrentQuestionIndex(0);
          setScore(0);
          setQuizCompleted(false);
          setQuestionType('');
          setQuestionCount('');
        }}
      >
        <Text style={tw`text-white text-center font-bold`}>Start New Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={tw`flex-1 bg-neutral-900`}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" style={tw`mt-8`} />
      ) : questions.length === 0 ? (
        renderQuizSetup()
      ) : quizCompleted ? (
        renderQuizResults()
      ) : (
        renderQuestion()
      )}
    </ScrollView>
  );
};

export default Quiz;