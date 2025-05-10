import React, { useEffect } from 'react';
import { View, useWindowDimensions, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Header } from '@/components/Header';
import { CurrentLevel } from '@/components/CurrentLevel';
import { Day } from '@/components/WeekDay';
import NotificationSettings from './notifications';

const ip = Constants.expoConfig?.extra?.serverIp;
const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log("----------------BACKGROUND TASK EXECUTED--------------");

  try {
    await Notifications.presentNotificationAsync({
      title: 'Traffic Alert',
      body: 'Traffic is building up!',
    });
  } catch (e) {
    console.error(e);
  }

  try {
    let shouldNotify = false;
    let data;

    try {
      const response = await fetch(ip + '/trafficLevel');
      data = await response.json();
      data = data.trafficLevel;
    } catch (e) {
      console.log(e);
    }

    if (data > 5) {
      const timeBefore = 3 * (data + 1); // MINUTES
      const currentDate = new Date();

      const notificationDataRaw = await AsyncStorage.getItem('notification-settings');
      if (!notificationDataRaw) return BackgroundFetch.BackgroundFetchResult.NoData;

      const { isNotificationToggled, notificationData } = JSON.parse(notificationDataRaw);

      if (isNotificationToggled) {
        const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        for (const entry of notificationData) {
          if (entry.day === today) {
            const arrival = new Date(currentDate);
            arrival.setHours(entry.arrivalTime.hours);
            arrival.setMinutes(entry.arrivalTime.minutes);
            arrival.setSeconds(0);

            const travelMins = entry.travelTime.hours * 60 + entry.travelTime.minutes;
            const travelTimeMs = travelMins * 60 * 1000;
            const timeBeforeMs = timeBefore * 60 * 1000;

            const startNotifyWindow = new Date(arrival.getTime() - travelTimeMs - timeBeforeMs);
            const endNotifyWindow = new Date(arrival.getTime() - travelTimeMs);

            if (currentDate >= startNotifyWindow && currentDate <= endNotifyWindow) {
              shouldNotify = true;
              break;
            }
          }
        }
      }
    }

    if (shouldNotify) {
        await Notifications.presentNotificationAsync({
        title: 'TEST NOTIFICATION',
        body: 'Current detected traffic level: ' + getText(data),
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.error(e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const Stack = createStackNavigator();  // Create a Stack navigator

export default function App() {
  useEffect(() => {
    requestPermissions();
    registerBackgroundTask();
    triggerTestNotification();
    
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Enable notifications in settings.');
    }
  };


  const registerBackgroundTask = async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60, // 1 minute
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  };

const triggerTestNotification = async () => {
    try {
      // Display a notification immediately
      await Notifications.presentNotificationAsync({
        title: 'TEST NOTIFICATION',
        body: 'This notification runs on app start',
      });
      console.log("TEST NOTIFICATION SENT");
    } catch (e) {
      console.log(e);
    }
  };



  const { width, height } = useWindowDimensions();

  return (
    // Wrap the entire app with NavigationContainer
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {() => (
            <View style={{ width, height, backgroundColor: 'white' }}>
              <Header title="Parking Availability" isReturnPage={false} />
              <CurrentLevel />
              <Day />
            </View>
          )}
        </Stack.Screen>
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const getText = (currLevel: number) => {
  const text = ["No Traffic", "Slight Traffic", "Light Traffic", "Moderate Traffic", "Busy Traffic", "Heavy Traffic", "Very Heavy Traffic", "Extreme Traffic", "Standstill Traffic"];
  return text[currLevel - 1];
};