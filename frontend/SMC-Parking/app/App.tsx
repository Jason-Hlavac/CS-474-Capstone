import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const ip = Constants.expoConfig?.extra?.serverIp;

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  
  try{
    await Notifications.presentNotificationAsync({
    title: 'Traffic Alert',
    body: 'Traffic is building up!',
    });
  } catch (e){
    console.error(e)
  }
  try {
    var shouldNotify = false;
    var data
    try{
      const response = await fetch(ip + '/trafficLevel');
      data = await response.json();
      data = data.trafficLevel;
    }catch (e){
      console.log(e)
    }

    // HEURISTICS
    if (data > 5) {
      const timeBefore = 3 * (data + 1); // MINUTES
      const currentDate = new Date();
    
      let notificationDataRaw = await AsyncStorage.getItem('notification-settings');
      if (!notificationDataRaw) return BackgroundFetch.BackgroundFetchResult.NoData;
    
      let { isNotificationToggled, notificationData } = JSON.parse(notificationDataRaw);
    
      if (isNotificationToggled) {
        const today = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
        for (let i = 0; i < notificationData.length; i++) {
          const entry = notificationData[i];
    
          if (entry.day == today){
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Traffic Alert',
          body: 'Traffic is building up!',
        },
        trigger: null,
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    console.error(e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});


export default function App() {
  useEffect(() => {
    requestPermissions();
    registerBackgroundTask();
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
        minimumInterval: 60 * 1, // 10 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  };

  return null;
}


const getText = ({currLevel}: {currLevel: number}) => {
  const text = ["No Traffic", "Slight Traffic", "Light Traffic", "Moderate Traffic", "Busy Traffic", "Heavy Traffic", "Very Heavy Traffic", "Extreme Traffic", "Standstill Traffic"];
  return(text[currLevel-1]);
}