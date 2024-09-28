import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

interface ARCameraProps {
  onClose: () => void;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const ARCamera: React.FC<ARCameraProps> = ({ onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <StyledView className="flex-1" />;
  }
  if (hasPermission === false) {
    return <StyledText className="text-center mt-10">No access to camera</StyledText>;
  }

  return (
    <StyledView className="flex-1">
      <Camera
        className="flex-1"
        type={CameraType.back}
        ref={(ref) => setCameraRef(ref)}
      />
      <StyledTouchableOpacity
        className="absolute top-10 left-10 bg-black bg-opacity-50 p-3 rounded-full"
        onPress={onClose}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </StyledTouchableOpacity>
    </StyledView>
  );
};

export default ARCamera;