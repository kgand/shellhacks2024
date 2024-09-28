import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Canvas, Path as SkiaPath, Skia, useTouchHandler, Text as SkiaText } from "@shopify/react-native-skia";
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

interface TextBubble {
  id: string;
  content: string;
  x: number;
  y: number;
}

const colorOptions = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isVisible, onClose, subjectId, onNoteCreated }) => {
  const [paths, setPaths] = useState<SketchPath[]>([]);
  const [redoPaths, setRedoPaths] = useState<SketchPath[]>([]);
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(true);
  const [textBubbles, setTextBubbles] = useState<TextBubble[]>([]);
  const [activeTextBubbleId, setActiveTextBubbleId] = useState<string | null>(null);

  const canvasRef = useRef(null);

  const handleSubmitSketch = async () => {
    setIsLoading(true);
    try {
      const base64Image = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
      });

      const response = await fetch('http://10.108.164.65:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sketch: base64Image,
          subjectId: subjectId
        })
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

  const handleCanvasPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    if (!isDrawingMode) {
      const newTextBubbleId = Date.now().toString();
      setTextBubbles([...textBubbles, { id: newTextBubbleId, content: '', x: locationX, y: locationY }]);
      setActiveTextBubbleId(newTextBubbleId);
    }
  };

  const handleTextBubblePress = (id: string) => {
    setActiveTextBubbleId(id);
  };

  const handleTextChange = (id: string, newContent: string) => {
    setTextBubbles(textBubbles.map(bubble => 
      bubble.id === id ? { ...bubble, content: newContent } : bubble
    ));
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={tw`flex-1 bg-neutral-900`}>
        <View style={tw`px-6 py-8 bg-black flex-row justify-between items-center`}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-3xl font-bold text-white`}>New Note</Text>
          <TouchableOpacity onPress={handleSubmitSketch}>
            <Text style={tw`text-lg font-semibold text-white`}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between items-center px-6 py-4 bg-neutral-800`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity onPress={handleUndo} style={tw`mr-8`}>
              <Ionicons name="arrow-undo" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRedo} style={tw`mr-8`}>
              <Ionicons name="arrow-redo" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsDrawingMode(!isDrawingMode)} style={tw`mr-8`}>
              <MaterialIcons name={isDrawingMode ? "edit" : "create"} size={28} color="white" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-row`}>
            {colorOptions.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  tw`w-10 h-10 rounded-full mr-4`,
                  { backgroundColor: c },
                  color === c && tw`border-4 border-white`,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </ScrollView>
        </View>
        <Canvas ref={canvasRef} style={tw`flex-1 bg-white`} onTouch={touchHandler} onPress={handleCanvasPress}>
          {paths.map((path, index) => (
            <SkiaPath
              key={index}
              path={path.path}
              color={path.color}
              style="stroke"
              strokeWidth={path.strokeWidth}
            />
          ))}
          {textBubbles.map((bubble) => (
            <SkiaText
              key={bubble.id}
              x={bubble.x}
              y={bubble.y}
              text={bubble.content}
              font={{ family: 'Arial', size: 16 }}
              color={color}
              onPress={() => handleTextBubblePress(bubble.id)}
            />
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