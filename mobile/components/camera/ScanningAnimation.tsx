import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window')

const ScanningAnimation = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const shrinkExpandAnimation = Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.2, // Shrink to 20% of original size
        duration: 1000, // Animation lasts for 2 seconds
        easing: Easing.inOut(Easing.ease), // Ease in and out
        useNativeDriver: true, // Use native driver for better performance
      }),
      Animated.timing(scaleValue, {
        toValue: 1, // Expand back to original size
        duration: 1000, // Animation lasts for 2 seconds
        easing: Easing.inOut(Easing.ease), // Ease in and out
        useNativeDriver: true, // Use native driver for better performance
      }),
    ]);

    // Start the animation
    shrinkExpandAnimation.start();

    // Optional: If you want the animation to repeat
    Animated.loop(shrinkExpandAnimation).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.square,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}

        className='border-4 border-white'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  square: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

export default ScanningAnimation;