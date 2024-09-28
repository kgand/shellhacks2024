import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler } from "@shopify/react-native-skia";
import { useNavigation } from '@react-navigation/native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';

interface Subject {
  id: string;
  name: string;
}

interface Note {
  id: string;
  subjectId: string;
  content: string;
}

interface SketchPath {
  path: Skia.Path;
  color: string;
  strokeWidth: number;
}

const Menu: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSketchModalVisible, setIsSketchModalVisible] = useState<boolean>(false);
  const [paths, setPaths] = useState<SketchPath[]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchSubjectsAndNotes();
  }, []);

  const fetchSubjectsAndNotes = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
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

  const handleSubmitSketch = async () => {
    setIsLoading(true);
    try {
      const sketchData = JSON.stringify(paths);

      // Replace with your actual API endpoint
      const response = await axios.post('http://your-flask-api-url/upload', {
        sketch: sketchData,
        subjectId: selectedSubject?.id
      });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Sketch Uploaded',
          text2: 'Your sketch has been saved successfully.',
        });

        setIsSketchModalVisible(false);
        setPaths([]);

        fetchSubjectsAndNotes();
      }
    } catch (error) {
      console.error('Error uploading sketch:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'There was an error saving your sketch.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDrawingStart = useCallback(
    (touchInfo: any) => {
      setPaths((currentPaths) => {
        const { x, y } = touchInfo;
        const newPath = Skia.Path.Make();
        newPath.moveTo(x, y);
        return [
          ...currentPaths,
          {
            path: newPath,
            color,
            strokeWidth,
          },
        ];
      });
    },
    [color, strokeWidth]
  );

  const onDrawingActive = useCallback((touchInfo: any) => {
    setPaths((currentPaths) => {
      const { x, y } = touchInfo;
      const currentPath = currentPaths[currentPaths.length - 1];
      const lastPoint = currentPath.path.getLastPt();
      const xMid = (lastPoint.x + x) / 2;
      const yMid = (lastPoint.y + y) / 2;

      currentPath.path.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);
      return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
    });
  }, []);

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
    },
    [onDrawingActive, onDrawingStart]
  );

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={tw`mb-4 p-4 bg-indigo-100 rounded-lg shadow-md flex-row items-center`}
      onPress={() => handleSubjectPress(item)}
    >
      <MaterialCommunityIcons name="book-open-variant" size={24} color="#4F46E5" />
      <Text style={tw`ml-3 text-lg font-semibold text-indigo-800`}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={tw`mb-4 p-4 bg-yellow-100 rounded-lg shadow-md`}>
      <Text style={tw`text-base text-yellow-800`}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[tw`flex-1 bg-gray-100`, { paddingTop: insets.top }]}>
      <View style={tw`px-4 py-6 bg-indigo-600`}>
        <Text style={tw`text-3xl font-bold text-white`}>Noted.</Text>
        <Text style={tw`text-lg text-indigo-200`}>Your notes, your way.</Text>
      </View>

      <ScrollView style={tw`flex-1 px-4 py-6`}>
        {selectedSubject ? (
          <>
            <TouchableOpacity
              style={tw`flex-row items-center mb-4`}
              onPress={() => setSelectedSubject(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#4F46E5" />
              <Text style={tw`ml-2 text-lg font-semibold text-indigo-600`}>Back to Subjects</Text>
            </TouchableOpacity>
            <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>{selectedSubject.name}</Text>
            <FlatList
              data={notes}
              renderItem={renderNoteItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 italic`}>No notes for this subject yet</Text>
              }
            />
          </>
        ) : (
          <>
            <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Your Subjects</Text>
            <FlatList
              data={subjects}
              renderItem={renderSubjectItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={tw`text-center text-gray-500 italic`}>No subjects available. Let's add some!</Text>
              }
            />
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg`}
        onPress={handleCreateNewNote}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={isSketchModalVisible} animationType="slide">
        <View style={tw`flex-1 bg-gray-100`}>
          <View style={tw`px-4 py-6 bg-indigo-600`}>
            <Text style={tw`text-2xl font-bold text-white`}>Create New Note</Text>
          </View>
          <Canvas style={tw`flex-1 bg-white`} onTouch={touchHandler}>
            {paths.map((path, index) => (
              <SkiaPath
                key={index}
                path={path.path}
                color={path.color}
                style="stroke"
                strokeWidth={path.strokeWidth}
              />
            ))}
          </Canvas>
          <View style={tw`flex-row justify-between px-4 py-4 bg-gray-200`}>
            <TouchableOpacity
              style={tw`bg-red-500 px-6 py-3 rounded-lg`}
              onPress={() => setIsSketchModalVisible(false)}
            >
              <Text style={tw`text-white font-semibold`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-green-500 px-6 py-3 rounded-lg`}
              onPress={handleSubmitSketch}
            >
              <Text style={tw`text-white font-semibold`}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
    </View>
  );
};

export default Menu;
