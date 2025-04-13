import { Text, View, useWindowDimensions } from "react-native";
import { Header, styles } from '@/components/Header';
import { CurrentLevel } from '@/components/CurrentLevel';
import { LevelHistory } from "@/components/LevelHistory";
import {Day} from "@/components/WeekDay";
// import { ParkingLots } from "@/components/LotsList";
// import { ThresholdLevel } from "@/components/Threshold"; 


export default function Index() {
  const { width, height} = useWindowDimensions();
  return (
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}>
      <Header title = {'Parking Availability'} isReturnPage = {false} />
      <CurrentLevel/>
      {/* <hr style={styles.hr}/> */}
      <Day/>
      
      {/* <hr style={styles.hr}/> */}
      {/* <hr style = {{width:10000}}/> */}
      <LevelHistory />
    </View>
  );
}
