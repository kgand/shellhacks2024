import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface Props {
    value: string;
    isSelected: boolean;
    onPress: () => void;
}

const Selector = ({ value, isSelected, onPress }: Props) => {
  return (
    <TouchableOpacity
      className={`py-2 px-3 my-2 mx-1 rounded-full ${
        isSelected ? 'bg-indigo-500 border-[1px] border-indigo-500' : 'bg-black border-[1px] border-gray-700' // Dynamic background color
      }`}
      onPress={onPress}
    >
      <Text className={`text-white text-center`}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

export default Selector;