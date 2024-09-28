import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, TextInput } from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler } from "@shopify/react-native-skia";
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { captureRef } from 'react-native-view-shot';

interface CreateNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  subjectId: string | null;
  onNoteCreated: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isVisible, onClose, subjectId, onNoteCreated }) => {
  const [paths, setPaths] = useState<SketchPath[]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<'draw' | 'text'>('draw');
  const [text, setText] = useState<string>('');
  const [history, setHistory] = useState<SketchPath[][]>([]);
  const [redoStack, setRedoStack] = useState<SketchPath[][]>([]);

  const canvasRef = useRef(null);

  const handleSubmitSketch = async () => {
    setIsLoading(true);
    try {
      const base64Image = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
        result: 'base64'
      });

      const requestBody = JSON.stringify({
        image: base64Image
      });

      const requestUrl = 'http://10.108.164.65:5000/upload';

      console.log('Request URL:', requestUrl);
      console.log('Request Body:', requestBody);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestBody
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Sketch Uploaded',
          text2: 'Your sketch has been saved successfully.',
        });

        onClose();
        setPaths([]);
        onNoteCreated();
      } else {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading sketch:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: `There was an error saving your sketch: ${error.message}`,
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
      setHistory((prevHistory) => [...prevHistory, paths]);
      setRedoStack([]);
    },
    [color, strokeWidth, paths]
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

  const handleUndo = () => {
    if (paths.length > 0) {
      setRedoStack((prevRedoStack) => [...prevRedoStack, paths]);
      setPaths(history[history.length - 1] || []);
      setHistory((prevHistory) => prevHistory.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      setHistory((prevHistory) => [...prevHistory, paths]);
      setPaths(redoStack[redoStack.length - 1]);
      setRedoStack((prevRedoStack) => prevRedoStack.slice(0, -1));
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={tw`flex-1 bg-gray-100`}>
        <View style={tw`px-4 py-6 bg-indigo-600`}>
          <Text style={tw`text-2xl font-bold text-white`}>Create New Note</Text>
        </View>
        <View style={tw`flex-row justify-between px-4 py-4 bg-gray-200`}>
          <TouchableOpacity
            style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
            onPress={() => setMode('draw')}
          >
            <Text style={tw`text-white font-semibold`}>Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
            onPress={() => setMode('text')}
          >
            <Text style={tw`text-white font-semibold`}>Text</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-yellow-500 px-6 py-3 rounded-lg`}
            onPress={handleUndo}
          >
            <Text style={tw`text-white font-semibold`}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-yellow-500 px-6 py-3 rounded-lg`}
            onPress={handleRedo}
          >
            <Text style={tw`text-white font-semibold`}>Redo</Text>
          </TouchableOpacity>
        </View>
        {mode === 'text' ? (
          <TextInput
            style={tw`flex-1 bg-white p-4`}
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Type your note here..."
          />
        ) : (
          <Canvas ref={canvasRef} style={tw`flex-1 bg-white`} onTouch={touchHandler}>
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
        )}
        <View style={tw`flex-row justify-between px-4 py-4 bg-gray-200`}>
          <TouchableOpacity
            style={tw`bg-red-500 px-6 py-3 rounded-lg`}
            onPress={onClose}
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
        {isLoading && (
          <View style={tw`absolute inset-0 bg-black bg-opacity-50 justify-center items-center`}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default CreateNoteModal;