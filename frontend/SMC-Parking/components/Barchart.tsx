import React from 'react';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import {ScrollView} from 'react-native';

export function TrafficGraph() {
  // Spreadsheet-style data (could be imported from a file)
  const spreadsheetData = [
    { time: '6:00', value: 20 },
    { time: '7:00', value: 45 },
    { time: '8:00', value: 28 },
    { time: '9:00', value: 80 },
    { time: '10:00', value: 99 },
    { time: '11:00', value: 43 },
    { time: '12:00', value: 20 },
    { time: '1:00', value: 45 },
    { time: '2:00', value: 28 },
    { time: '3:00', value: 80 },
    { time: '4:00', value: 99 },
    { time: '5:00', value: 43 }
  ];

  // Transform spreadsheet data to chart format
  const chartData = {
    labels: spreadsheetData.map(entry => entry.time),
    datasets: [{
      data: spreadsheetData.map(entry => entry.value)
    }]
  };

  return (
    <ScrollView horizontal style = {{width: '80%', alignSelf: 'center', display: 'flex', borderRadius: 15}} persistentScrollbar = {true}>
    <BarChart
      data={chartData}
      width={Dimensions.get('window').width*1.5}
      height={220}
      yAxisLabel=""
      yAxisSuffix=""
      withHorizontalLabels={false}
      chartConfig={{
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#d8e5f0',
        decimalPlaces: 0,
        fillShadowGradient: '#FF0000', // Solid color
        fillShadowGradientOpacity: 1,
        color: (opacity = 1) => `#d8e5f0)`,
        // barPercentage: 0.5
      }}
      style={{ marginVertical: 10, alignSelf: 'center', paddingRight: 20}}
    />
    </ScrollView>
  );
}
