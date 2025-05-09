import React, { useState, useEffect } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView, Image, View, StyleSheet, Dimensions, Text } from 'react-native';
import Constants from 'expo-constants';

const ip = Constants.expoConfig?.extra?.serverIp;

export function TrafficGraph({ weekDay }: { weekDay: string }) {
  // Spreadsheet-style data (could be imported from a file)
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
  } else {
    // Find the data for the selected day
    const selected = spreadsheetData.find(dayObj => Object.keys(dayObj)[0] === weekDay);
    const entries = selected ? selected[weekDay] : [];

    if (entries.length === 0) {
      return (
        <View style={styles.staticContainer}>
          <Text style={styles.noDataText}>No data available for {weekDay}</Text>
        </View>
      );
    }

    const chartData = {
      labels: entries.map(entry => entry.time),
      datasets: [{
        data: entries.map(entry => entry.value),
      }]
    };

    return (
      <ScrollView horizontal style={{ width: '80%', alignSelf: 'center', display: 'flex', borderRadius: 15 }} persistentScrollbar={true}>
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width * 1.5}
          height={300}
          yAxisLabel=""
          yAxisSuffix=""
          withInnerLines={false}
          withHorizontalLabels={false}
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#d8e5f0',
            decimalPlaces: 0,
            fillShadowGradient: '#FF0000', // Solid color
            fillShadowGradientOpacity: 1,
            color: (opacity = 1) => '#000000',
            // barPercentage: 0.5
          }}
          style={{ marginVertical: 10, alignSelf: 'center', paddingRight: 20 }}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  staticContainer: {
    width: '80%',
    display: 'flex',
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
  }
});