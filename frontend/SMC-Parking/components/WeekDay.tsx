import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Header, styles } from '@/components/Header';
import { ComponentText } from './ComponentText';
//import { TrafficGraph } from './Barchart';

export function Day() {
  // Gets us the current day of week
  const currentDate = new Date();
  const [currentDay, setCurrentDay] = useState(currentDate.getDay());
  const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <ComponentText displayText={'Current Traffic Level'} />
      <View style={weekStyles.weekContainer}>
        {week.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              weekStyles.weekButton,
              index === currentDay ? weekStyles.selectedDay : null,
            ]}
            onPress={() => setCurrentDay(index)} // Change currentDay when clicked
          >
            <Text
              style={[
                weekStyles.weekText,
                index === currentDay ? weekStyles.selectedDayText : null,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.hr} />
      <View style={weekStyles.container}>
        
      </View>
    </>
  );
}

const weekStyles = StyleSheet.create({
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weekButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  selectedDay: {
    backgroundColor: '#800000', // Highlight the selected day
    borderRadius: 10,
  },
  selectedDayText: {
    color: '#ffffff', // Change text color for selected day
  },
  weekText: {
    fontFamily: 'Bree Serif',
    fontSize: 20,
    color: '#000000',
  },
  container: {
    margin: '3%',
    alignSelf: 'center',
    justifyContent: 'center',
    height: '35%',
    width: '80%',
    backgroundColor: '#d8e5f0',
    borderRadius: 15,
  },
});