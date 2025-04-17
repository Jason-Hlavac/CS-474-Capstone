import {View, useWindowDimensions } from "react-native";
import { Header } from '@/components/Header';
import { CurrentLevel } from '@/components/CurrentLevel';
import { Day } from '@/components/WeekDay';


export default function Index() {
  const { width, height} = useWindowDimensions();
  return (
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}>
      <Header title = {'Parking Availability'} isReturnPage = {false} />
      <CurrentLevel/>
      <Day/>
    </View>
  );
}
