import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const AnimatedBackground: React.FC = () => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height],
  });

  const generateRandomShapes = () => {
    const shapes = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 2;
      const size = Math.random() * 30 + 10;
      const opacity = Math.random() * 0.3 + 0.1;
      const shape = Math.floor(Math.random() * 4);

      switch (shape) {
        case 0:
          shapes.push(<Path key={i} d={`M${x},${y} l${size},0 l${-size/2},${size*Math.sqrt(3)/2} z`} fill={`rgba(255,255,255,${opacity})`} />);
          break;
        case 1:
          shapes.push(<Circle key={i} cx={x} cy={y} r={size/2} fill={`rgba(255,255,255,${opacity})`} />);
          break;
        case 2:
          shapes.push(<Path key={i} d={`M${x},${y} h${size} v${size} h${-size} z`} fill={`rgba(255,255,255,${opacity})`} />);
          break;
        case 3:
          shapes.push(<Path key={i} d={`M${x},${y} q${size/2},${size} ${size},0`} stroke={`rgba(255,255,255,${opacity})`} strokeWidth="2" fill="none" />);
          break;
      }
    }
    return shapes;
  };

  return (
    <View style={{ position: 'absolute', width, height }}>
      <Svg width={width} height={height * 2} viewBox={`0 0 ${width} ${height * 2}`}>
        <AnimatedG style={{ transform: [{ translateY }] }}>
          {generateRandomShapes()}
          <Path d="M50 100 L100 100 M75 75 L75 125" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <Path d="M150 200 Q200 150 250 200" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <Path d="M300 100 L350 100 L325 150" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <Path d="M100 300 L150 350 L140 360 L90 310 Z" fill="rgba(255,255,255,0.2)" />
          <Path d="M0 400 L400 400 M0 450 L400 450 M0 500 L400 500" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <Path d="M200 600 L250 600 M225 575 L225 625" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <Path d="M300 700 L350 700 M325 675 L325 725" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <Path d="M100 800 C150 750 200 850 250 800" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        </AnimatedG>
      </Svg>
    </View>
  );
};

export default AnimatedBackground;