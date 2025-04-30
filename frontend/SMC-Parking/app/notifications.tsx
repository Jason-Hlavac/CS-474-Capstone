import { View, useWindowDimensions } from "react-native";
import { Header } from '@/components/Header'
import { NotificationToggle } from "@/components/NotificationToggle";
import { NotificationForm } from "@/components/NotificationForm";
import { NotificationScroller } from "@/components/NotificationScroller";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

type NotificationType = {
  day: string;
  arrivalTime: { hours: number; minutes: number };
  travelTime: { hours: number; minutes: number };
};

type StoredData = {
  isNotificationToggled: boolean;
  notificationData: NotificationType[];
};

export default function Index() {
  const { width, height} = useWindowDimensions();
  const [notificationData, setNotificationData] = useState<NotificationType[]>([]);
  const [isNotificationToggled, setIsNotificationToggled] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem('notification-settings');
        if (stored) {
          const parsed: StoredData = JSON.parse(stored);
          setNotificationData(parsed.notificationData);
          setIsNotificationToggled(parsed.isNotificationToggled);
        }
      } catch (error) {
        console.error('Error loading from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToStore: StoredData = {
          isNotificationToggled,
          notificationData,
        };
        await AsyncStorage.setItem('notification-settings', JSON.stringify(dataToStore));
      } catch (error) {
        console.error('Error saving to AsyncStorage:', error);
      }
    };

    saveData();
  }, [notificationData, isNotificationToggled]);


    return(
    <View
      style={{
        width, height, backgroundColor: 'white', overflowX: 'hidden',
      }}
    >
      <Header title = {'Notification Settings'} isReturnPage = {true} />
      <NotificationToggle isNotificationToggled={isNotificationToggled} setIsNotificationToggled={setIsNotificationToggled}/>
      <NotificationForm notificationData={notificationData} setNotificationData={setNotificationData}/>
      <NotificationScroller notificationData={notificationData} setNotificationData={setNotificationData}/>
    </View>
  );
}
