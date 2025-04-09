import { Text, View, useWindowDimensions } from "react-native";
import { Header } from '@/components/Header'

export default function Index() {
  const { width, height} = useWindowDimensions();
  return (
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}
    >
      <Header title = {'Notification Settings'} isReturnPage = {true} />
    </View>
  );
}
