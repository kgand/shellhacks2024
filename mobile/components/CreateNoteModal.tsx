import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler } from '@shopify/react-native-skia';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';

interface CreateNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  subjectId: string | null;
  onNoteCreated: () => void;
  userId: string | undefined;
}

interface SketchPath {
  path: any;
  color: string;
  strokeWidth: number;
}

const colorOptions = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#ADFF2F',
  '#8B4513', '#4B0082', '#FF4500', '#00CED1', '#FF1493',
];

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isVisible,
  onClose,
  subjectId,
  onNoteCreated,
  userId,
}) => {
  const [paths, setPaths] = useState<SketchPath[]>([]);
  const [redoPaths, setRedoPaths] = useState<SketchPath[]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const canvasRef = useRef(null);

  const handleSubmitSketch = async () => {
    setIsLoading(true);
    try {
      const base64Image = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
        result: 'base64',
      });

      const response = await fetch('http://10.108.74.57:5000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          userId,
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Note Saved',
          text2: 'Your note has been saved successfully.',
        });

        onClose();
        setPaths([]);
        setRedoPaths([]);
        onNoteCreated();
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'There was an error saving your note.',
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

  const onDrawingActive = useCallback(
    (touchInfo: any) => {
      setPaths((currentPaths) => {
        const { x, y } = touchInfo;
        const currentPath = currentPaths[currentPaths.length - 1];
        const lastPoint = currentPath.path.getLastPt();
        const xMid = (lastPoint.x + x) / 2;
        const yMid = (lastPoint.y + y) / 2;

        currentPath.path.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);
        return [...currentPaths.slice(0, currentPaths.length - 1), currentPath];
      });
    },
    []
  );

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
    },
    [onDrawingActive, onDrawingStart]
  );

  const handleUndo = useCallback(() => {
    setPaths((currentPaths) => {
      if (currentPaths.length === 0) return currentPaths;
      const newRedoPaths = [...redoPaths, currentPaths[currentPaths.length - 1]];
      setRedoPaths(newRedoPaths);
      return currentPaths.slice(0, -1);
    });
  }, [redoPaths]);

  const handleRedo = useCallback(() => {
    setRedoPaths((currentRedoPaths) => {
      if (currentRedoPaths.length === 0) return currentRedoPaths;
      const newPaths = [...paths, currentRedoPaths[currentRedoPaths.length - 1]];
      setPaths(newPaths);
      return currentRedoPaths.slice(0, -1);
    });
  }, [paths]);

  const handleColorSelect = useCallback((selectedColor: string) => {
    setColor(selectedColor);
    setStrokeWidth(selectedColor === '#FFFFFF' ? 20 : 5);
  }, []);

  const MemoizedColorOptions = useMemo(() => (
    colorOptions.map((c) => (
      <TouchableOpacity
        key={c}
        style={[
          tw`w-8 h-8 rounded-full mx-1`,
          { backgroundColor: c },
          color === c && tw`border-2 border-white`,
          c === '#FFFFFF' && tw`border border-gray-300`,
        ]}
        onPress={() => handleColorSelect(c)}
      />
    ))
  ), [color, handleColorSelect]);

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={tw`flex-1 bg-neutral-900`}>
        <View style={tw`mt-10 px-4 py-3 bg-neutral-800 flex-row justify-between items-center`}>
          <TouchableOpacity 
            onPress={onClose}
            style={tw`bg-neutral-700 rounded-full p-2`}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-xl font-bold text-white`}>New Note</Text>
          <TouchableOpacity 
            onPress={handleSubmitSketch}
            style={tw`bg-blue-500 rounded-full px-4 py-2`}
          >
            <Text style={tw`text-white font-semibold`}>Upload</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between items-center px-4 py-2 bg-neutral-800`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={handleUndo} style={tw`mr-4 bg-neutral-700 rounded-full p-2`}>
              <Ionicons name="arrow-undo" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRedo} style={tw`mr-6 bg-neutral-700 rounded-full p-2`}>
              <Ionicons name="arrow-redo" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={tw`flex-row`}
          >
            {MemoizedColorOptions}
          </ScrollView>
        </View>
        <Canvas ref={canvasRef} style={tw`flex-1 bg-white`} onTouch={touchHandler}>
          {paths.map((path, index) => (
            <SkiaPath key={index} path={path.path} color={path.color} style="stroke" strokeWidth={path.strokeWidth} />
          ))}
        </Canvas>
        {isLoading && (
          <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default React.memo(CreateNoteModal);