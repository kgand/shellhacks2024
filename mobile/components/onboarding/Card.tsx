import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from "react-native";
import Selector from "./Selector";
import AddModal from "./Modal";
import AnimatedBackground from "../AnimatedBackground";

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
  ]);

  const groupItems = items.reduce((groups, item) => {
    const { subject } = item;
    if (!groups[subject]) {
      groups[subject] = [];
    }
    groups[subject].push(item);
    return groups;
  }, {} as Record<string, selectable[]>);

  const toggleItemActive = (value: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.value === value ? { ...item, active: !item.active } : item
      )
    );
  };

  const addItem = (newItem: selectable) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };


  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.card}>
        <Text style={styles.title}>Select your current classes</Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          {Object.entries(groupItems).map(([subject, items]) => (
            <View key={subject} style={styles.subjectContainer}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectTitle}>{subject}</Text>
              </View>
              <View style={styles.itemsContainer}>
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
        <TouchableOpacity onPress={() => setModalShown(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add custom class</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <AddModal
          visible={modalShow}
          onClose={() => setModalShown(false)}
          onAdd={addItem}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  card: {
    width: '80%',
    maxHeight: '90%',
    aspectRatio: 5/6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
    marginBottom: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  subjectContainer: {
    marginBottom: 15,
    width: '100%',
  },
  subjectHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  continueButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});