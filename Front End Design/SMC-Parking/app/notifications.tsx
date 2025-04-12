import { Text, View, useWindowDimensions } from "react-native";
import { Header } from '@/components/Header'
import { NotificationToggle } from "@/components/NotificationToggle";
import { NotificationForm } from "@/components/NotificationForm";
import { NotificationScroller } from "@/components/NotificationScroller";

export default function Index() {
  const { width, height} = useWindowDimensions();
  return (
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}
    >
      <Header title = {'Notification Settings'} isReturnPage = {true} />
      <NotificationToggle/>
      <NotificationForm/>
      <NotificationScroller/>
    </View>
  );
}
