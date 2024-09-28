import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler } from '@shopify/react-native-skia';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { captureRef } from 'react-native-view-shot';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface CreateNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  subjectId: string | null;
  onNoteCreated: () => void;
}

interface SketchPath {
  path: any;
  color: string;
  strokeWidth: number;
}

const colorOptions = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFFFFF', // White (Eraser)
  '#000000', // Black
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#FFD700', // Gold
  '#ADFF2F', // GreenYellow
  // Add more colors as needed
];

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isVisible,
  onClose,
  subjectId,
  onNoteCreated,
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
      });

      const response = await fetch('http://your-flask-api-url/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketch: base64Image,
          subjectId,
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

  const handleUndo = () => {
    setPaths((currentPaths) => {
      if (currentPaths.length === 0) return currentPaths;
      const newRedoPaths = [...redoPaths, currentPaths[currentPaths.length - 1]];
      setRedoPaths(newRedoPaths);
      return currentPaths.slice(0, -1);
    });
  };

  const handleRedo = () => {
    setRedoPaths((currentRedoPaths) => {
      if (currentRedoPaths.length === 0) return currentRedoPaths;
      const newPaths = [...paths, currentRedoPaths[currentRedoPaths.length - 1]];
      setPaths(newPaths);
      return currentRedoPaths.slice(0, -1);
    });
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    // If the selected color is white, set strokeWidth to 0 for eraser effect
    if (selectedColor === '#FFFFFF') {
      setStrokeWidth(0); // Set to 0 to act as an eraser
    } else {
      setStrokeWidth(5); // Reset to default stroke width for drawing
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={tw`flex-1 bg-neutral-900`}>
        {/* Adjust the header styles to move it down */}
        <View style={tw`mt-10 px-6 py-4 bg-black flex-row justify-between items-center`}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-2xl font-bold text-white`}>New Note</Text>
          <TouchableOpacity onPress={handleSubmitSketch}>
            <Text style={tw`text-lg font-semibold text-white`}>Save</Text>
          </TouchableOpacity>
        </View>
        {/* Center the color options and adjust the undo/redo buttons */}
        <View style={tw`flex-row justify-between items-center px-6 py-4 bg-neutral-800`}>
          <TouchableOpacity onPress={handleUndo} style={tw`mr-4`}>
            <Ionicons name="arrow-undo" size={24} color="white" />
          </TouchableOpacity>
          {/* Centering the colors */}
          <View style={tw`flex-1 justify-center`}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={tw`flex-row justify-center`} // Center colors
            >
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    tw`w-10 h-10 rounded-full mx-2`,
                    { backgroundColor: c },
                    color === c && tw`border-4 border-white`,
                  ]}
                  onPress={() => handleColorSelect(c)} // Use the new handler
                />
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity onPress={handleRedo} style={tw`ml-4`}>
            <Ionicons name="arrow-redo" size={24} color="white" />
          </TouchableOpacity>
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

export default CreateNoteModal;