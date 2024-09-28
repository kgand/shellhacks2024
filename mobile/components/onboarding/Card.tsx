import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Selector from "./Selector";
import AddModal from "./Modal";

export interface selectable {
  value: string;
  subject: string;
  active: boolean;
}

export default function Card() {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<selectable[]>([]);
  const [modalShow, setModalShown] = useState<boolean>(false);

  const [items, setItems] = useState<selectable[]>([
    { value: "Calculus I", subject: "Mathematics", active: false },
    {
      value: "American Government",
      subject: "Political Science",
      active: false,
    },
    { value: "Physics 1", subject: "Science", active: false },
    { value: "Chemistry 1", subject: "Science", active: false },
    { value: "Linear Algebra", subject: "Mathematics", active: false },
    { value: "Programming 101", subject: "Computer Science", active: false },
    { value: "Biology 101", subject: "Science", active: false },
    { value: "World History", subject: "History", active: false },
    { value: "Statistics", subject: "Mathematics", active: false },
    { value: "Economics", subject: "Social Science", active: false },
    { value: "Philosophy", subject: "Humanities", active: false },
    { value: "English Literature", subject: "Humanities", active: false },
    { value: "Data Structures", subject: "Computer Science", active: false },
    { value: "Web Development", subject: "Computer Science", active: false },
    { value: "Discrete Mathematics", subject: "Mathematics", active: false },
    { value: "Graphic Design", subject: "Art", active: false },
    { value: "Chemistry II", subject: "Science", active: false },
    { value: "Sociology", subject: "Social Science", active: false },
    { value: "Psychology 101", subject: "Social Science", active: false },
    { value: "Environmental Science", subject: "Science", active: false },
    { value: "Digital Marketing", subject: "Business", active: false },
    { value: "Machine Learning", subject: "Computer Science", active: false },
    { value: "Computer Networks", subject: "Computer Science", active: false },
    { value: "Organic Chemistry", subject: "Science", active: false },
    { value: "Art History", subject: "Art", active: false },
    { value: "Introduction to Music", subject: "Art", active: false },
    { value: "Business Management", subject: "Business", active: false },
    { value: "Creative Writing", subject: "Humanities", active: false },
    { value: "Advanced Calculus", subject: "Mathematics", active: false },
    { value: "Microeconomics", subject: "Economics", active: false },
    { value: "Astrophysics", subject: "Science", active: false },
    { value: "Ethics in Technology", subject: "Philosophy", active: false },
    {
      value: "Mobile App Development",
      subject: "Computer Science",
      active: false,
    },
    { value: "Public Speaking", subject: "Communication", active: false },
    {
      value: "International Relations",
      subject: "Political Science",
      active: false,
    },
    { value: "Health and Wellness", subject: "Health", active: false },
    { value: "Cognitive Psychology", subject: "Psychology", active: false },
    { value: "Social Media Strategy", subject: "Business", active: false },
    {
      value: "Cybersecurity Fundamentals",
      subject: "Computer Science",
      active: false,
    },
    { value: "History of Philosophy", subject: "Philosophy", active: false },
    {
      value: "Introduction to Game Design",
      subject: "Game Design",
      active: false,
    },
    { value: "Algorithm Design", subject: "Computer Science", active: false },
    { value: "Quantum Mechanics", subject: "Physics", active: false },
    { value: "Nutrition Science", subject: "Health", active: false },
    { value: "Human Anatomy", subject: "Biology", active: false },
    { value: "Introduction to Accounting", subject: "Business", active: false },
    { value: "Theatre Arts", subject: "Art", active: false },
    {
      value: "Software Engineering",
      subject: "Computer Science",
      active: false,
    },
    {
      value: "Artificial Intelligence",
      subject: "Computer Science",
      active: false,
    },
    { value: "Financial Accounting", subject: "Business", active: false },
    {
      value: "Database Management",
      subject: "Computer Science",
      active: false,
    },
    { value: "Contemporary Dance", subject: "Art", active: false },
    { value: "Sports Psychology", subject: "Psychology", active: false },
    { value: "Forensic Science", subject: "Science", active: false },
    { value: "Film Studies", subject: "Art", active: false },
    { value: "Data Analysis", subject: "Data Science", active: false },
    { value: "Fashion Design", subject: "Art", active: false },
    { value: "Neuroscience", subject: "Biology", active: false },
    { value: "Public Health", subject: "Health", active: false },
    { value: "Veterinary Science", subject: "Health", active: false },
    { value: "Television Production", subject: "Art", active: false },
    { value: "Special Topics in History", subject: "History", active: false },
  ]);

  const groupItemsBySubject = (items: selectable[]) => {
    return items.reduce<Record<string, selectable[]>>((acc, item) => {
      if (!acc[item.subject]) {
        acc[item.subject] = [];
      }
      acc[item.subject].push(item);
      return acc;
    }, {});
  };

  const groupItems = groupItemsBySubject(items);

  const toggleItemActive = (itemValue: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.value === itemValue ? { ...item, active: !item.active } : item
      )
    );

    setSelectedItems((prevSelected) => {
      const item = items.find((i) => i.value === itemValue);
      if (!item) return prevSelected;

      if (item.active) {
        // Item was active, so we need to remove it from selected items
        return prevSelected.filter((i) => i.value !== itemValue);
      } else {
        // Item was inactive, so we need to add it to selected items
        return [...prevSelected, { ...item, active: true }];
      }
    });
  };

  const addItem = (item: selectable) => {
    setItems([...items, item]);
  };

  console.log(selectedItems);
  return (
    <View className="h-[70%] w-[70%] border-neutral-700 border-[1px] rounded-2xl p-10 flex items-center flex-col">
      <Text className="text-white font-semibold text-2xl mb-10">
        Select your current classes
      </Text>
      <ScrollView className="flex-grow w-[90%] mb-10">
        {Object.entries(groupItems).map(([subject, items]) => (
          <View key={subject} className="mb-4">
            <View className="w-full justify-center items-center">
              <Text className="text-xl font-bold mb-2 text-white">
                {subject}
              </Text>
            </View>
            <View className="flex flex-wrap flex-row justify-center">
              {items.map((item) => (
                <Selector
                  key={item.value}
                  value={item.value}
                  isSelected={item.active}
                  onPress={() => toggleItemActive(item.value)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => setModalShown(true)} className="bg-blue-500 px-3 py-2 mb-5 rounded-xl">
        <Text className="text-white">+ Add custom class</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-white w-[70%] h-[8%] justify-center items-center rounded-lg">
        <Text className="text-black font-semibold text-xl">Continue</Text>
      </TouchableOpacity>
      <AddModal
        visible={modalShow}
        onClose={() => setModalShown(false)}
        onAdd={addItem}
      />
    </View>
  );
}
