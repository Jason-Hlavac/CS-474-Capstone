import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions } from 'react-native';
import Constants from 'expo-constants';

const ip = Constants.expoConfig?.extra?.serverIp;

export function TrafficGraph({ weekDay }: { weekDay: string }) {
  const [spreadsheetData, setSpreadSheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    async function fetchSpreadSheet() {
      try {
        setIsLoading(true);
        const response = await fetch(ip + '/history');
        const data = await response.json();
        setSpreadSheetData(data.historyData);
      } catch (e) {
        setNoData(true);
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSpreadSheet();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.staticContainer}>
        <Image style={styles.loadingImage} source={require('../assets/images/loading.gif')} />
      </View>
    );
  } else if (noData) {
    return (
      <View style={styles.staticContainer}>
        <Text style={styles.noDataText}>Could Not Retrieve Data</Text>
      </View>
    );
  }

  const selected = spreadsheetData.find(dayObj => Object.keys(dayObj)[0] === weekDay);
  const entries = selected ? selected[weekDay] : [];

  if (entries.length === 0) {
    return (
      <View style={styles.staticContainer}>
        <Text style={styles.noDataText}>No data available for {weekDay}</Text>
      </View>
    );
  }

  const maxValue = Math.max(...entries.map(entry => entry.value)); 

  return (
    <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}>
      <View style={styles.chartContainer}>
        {entries.map((entry, index) => {
          const barHeight = (entry.value / maxValue) * 250; // Scale bar height to the max value
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={[styles.bar, { height: barHeight }]} />
              <Text style={styles.barLabel}>{entry.time}</Text> 
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  staticContainer: {
    width: '80%',
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  loadingImage: {
    height: '100%',
    alignSelf: 'center',
  },
  noDataText: {
    fontFamily: 'Bree Serif',
    fontSize: 20,
    color: '#013564',
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', 
    justifyContent: 'space-around',
    width: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  bar: {
    width: 30,
    backgroundColor: '#D82732',
    borderRadius: 5,
    marginBottom: 5, 
  },
  barLabel: {
    fontSize: 10,
    color: '#000000',
    marginTop: 5,
    textAlign: 'center', 
  },
});