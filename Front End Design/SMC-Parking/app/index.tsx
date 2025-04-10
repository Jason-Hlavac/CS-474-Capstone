import { Text, View, useWindowDimensions } from "react-native";
import { Header } from '@/components/Header';
import { CurrentLevel } from '@/components/CurrentLevel';
import { LevelHistory } from "@/components/LevelHistory";


export default function Index() {
  const { width, height} = useWindowDimensions();
  return (
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}>
      <Header title = {'Parking Availability'} isReturnPage = {false} />
      <CurrentLevel currLevel = { 5 } />
      <LevelHistory />
    </View>
  );
}
