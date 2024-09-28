import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler } from "@shopify/react-native-skia";
import Toast from 'react-native-toast-message';
import axios from 'axios';
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

  const canvasRef = useRef(null);

  const handleSubmitSketch = async () => {
    setIsLoading(true);
    try {
      const base64Image = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
      });

      const response = await axios.post('http://your-flask-api-url/upload', {
        sketch: base64Image,
        subjectId: subjectId
      });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Sketch Uploaded',
          text2: 'Your sketch has been saved successfully.',
        });

        onClose();
        setPaths([]);
        onNoteCreated();
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

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={tw`flex-1 bg-gray-100`}>
        <View style={tw`px-4 py-6 bg-indigo-600`}>
          <Text style={tw`text-2xl font-bold text-white`}>Create New Note</Text>
        </View>
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