import {
  CameraCapturedPicture,
  CameraPictureOptions,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Text, TouchableOpacity, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Subscription } from "expo-sensors/build/Pedometer";
import { returnNotes } from "@/utils/inference";
import { auth } from "@/configs/firebase";
import { Ionicons } from "@expo/vector-icons";
import ScanningAnimation from "./ScanningAnimation";

interface Props {
  onClose: () => void;
}

export default function ARCamera({ onClose }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [steady, setSteady] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pic, setPic] = useState<CameraCapturedPicture | null>(null);
  const [isTakingPicture, setIsTakingPicture] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [canTakePicture, setCanTakePicture] = useState<boolean>(true); // New state to control picture-taking
  const [responseImage, setResponseImage] = useState<string | null>(null);

  const [counter, setCounter] = useState<number>(0);

  Accelerometer.setUpdateInterval(500);

  const threshold = 0.25;

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [{ x2, y2, z2 }, setLastData] = useState({
    x2: 0,
    y2: 0,
    z2: 0,
  });

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    const dx = x - x2;
    const dy = y - y2;
    const dz = z - z2;

    const overall = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

    setLastData({ x2: x, y2: y, z2: z });

    if (overall < threshold) {
      setSteady(true);
      if (!responseImage) setCounter((n) => n + 1);
      if (!fetching) {
        setCanTakePicture(true);
      }
    } else {
      setSteady(false);
      setPic(null);
      setCounter(0);
      setResponseImage(null);
    }

    console.log(`${x}, ${y}, ${z}`);
  }, [x, y, z]);

  // This is to take pics
  useEffect(() => {
    if (counter < 8) {
      console.log("Keep holding steady to take pics");
    } else if (
      counter >= 8 &&
      !fetching &&
      !isTakingPicture &&
      canTakePicture
    ) {
      takePicture();
    }
  }, [counter, fetching, isTakingPicture]);

  useEffect(() => {
    if (pic && !fetching) {
      sendImage();
    }
  }, [pic, fetching]);

  const takePicture = async () => {
    if (isTakingPicture) return; // Prevent taking picture if already taking one
    setIsTakingPicture(true);
    setCanTakePicture(false); // Disable further picture taking until movement is detected

    const options: CameraPictureOptions = {
      quality: 0.1,
      base64: true,
      exif: false,
      skipProcessing: true,
    };

    const data = await cameraRef.current?.takePictureAsync(options);
    console.log(data?.base64!.slice(0, 100));

    setPic(data!);
    // Do not set `isTakingPicture` to false here; wait until fetching is done.
  };

  const sendImage = async () => {
    if (!pic?.base64 || !auth.currentUser?.uid) {
      console.log("BRUH FAILED NOTHING");
      return;
    }

    setFetching(true);
    console.log("FETCHING!");

    const result = await returnNotes(pic.base64, auth.currentUser.uid);

    console.log(result);

    setResponseImage(result["matched_notes"][0]);

    setFetching(false);
    setCounter(0);
    setPic(null);
    setIsTakingPicture(false); // Allow taking pictures again
    // The camera can take pictures again after movement is detected
  };

  const _subscribe = () => {
    setSubscription(Accelerometer.addListener(setData));
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View>
        <Text>Camera Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View className="flex-1 w-full">
      <CameraView
        className="flex-1 w-full justify-center items-center relative"
        animateShutter={false}
        ref={cameraRef}
        facing={facing}
      >
        <TouchableOpacity
          className="p-2 absolute top-10 left-10 bg-neutral-700 rounded-full"
          onPress={onClose}
        >
          <Ionicons size={40} color="white" name="chevron-back-outline" />
        </TouchableOpacity>

        <View className="absolute w-[50%] h-[50%] bottom-2 right-2 rounded-xl">
          {responseImage ? (
            <Image
              className="flex-1 w-full bg-contain rounded-xl"
              source={{ uri: `data:image/png;base64,${responseImage}` }}
            />
          ) : (
            <></>
          )}
        </View>

        {steady ? (
          !responseImage && <ScanningAnimation />
        ) : (
          <View className="bg-black/20 py-3 px-5 rounded-3xl bg-opacity-50">
            <Text className="text-white">Stay steady to scan</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
}
