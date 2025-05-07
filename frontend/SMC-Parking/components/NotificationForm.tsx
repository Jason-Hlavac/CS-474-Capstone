import React, { useState } from 'react';
import { StyleSheet, View, Button, Text} from 'react-native';
import { TimePickerModal } from 'react-native-paper-dates';
import {Picker} from '@react-native-picker/picker';

type NotificationType = {
    day: string;
    arrivalTime: { hours: number; minutes: number };
    travelTime: { hours: number; minutes: number };
  };
  
  type StoredData = {
    isNotificationToggled: boolean;
    notificationData: NotificationType[];
  };

export function NotificationForm({notificationData, setNotificationData}: {notificationData : NotificationType[]; setNotificationData: React.Dispatch<React.SetStateAction<NotificationType[]>>;}){
    const [selectedDay, setSelectedDay] = useState('mon');
    const [arrivalTime, setArrivalTime] = useState({ hours: 12, minutes: 0 });
    const [arrivalVisible, setArrivalVisible] = useState(false);
    const isPM = arrivalTime.hours >= 12;
    const amOrPm = isPM ? 'PM' : 'AM';
    
    const [travelTime, setTravelTime] = useState({ hours: 0, minutes: 30 });
    const [travelVisible, setTravelVisible] = useState(false);
    function processForm(){
        setNotificationData(([...notificationData, { day: selectedDay, arrivalTime: arrivalTime, travelTime: travelTime}]));
    }

    return(<>
        <View style = {styles.container}>

            <View style={{ width: '40%', height: 50 }}>
                <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)}>
                    <Picker.Item label = 'Monday' value = 'mon'></Picker.Item>
                    <Picker.Item label = 'Tuesday' value = 'tues'></Picker.Item>
                    <Picker.Item label = 'Wednesday' value = 'wed'></Picker.Item>
                    <Picker.Item label = 'Thursday' value = 'thu'></Picker.Item>
                    <Picker.Item label = 'Friday' value = 'fri'></Picker.Item>
                    <Picker.Item label = 'Saturday' value = 'sat'></Picker.Item>
                    <Picker.Item label = 'Sunday' value = 'sun'></Picker.Item>
                </Picker>
                </View>

                <View style = {styles.break}>
                    <View style = {styles.halfScreen}>
                        <Text style = {styles.formText}>Arrival Time</Text>
                    </View>
                    <View style = {styles.halfScreen}>
                        <Button color={'#D82732'} onPress={() => setArrivalVisible(true)} title = {String(arrivalTime.hours%12 || 12).padStart(2, '0') + ":" + String(arrivalTime.minutes).padStart(2, '0') + " " + amOrPm}/>
                    
                    
                        <TimePickerModal
                            visible={arrivalVisible}
                            hours={arrivalTime?.hours || 0}
                            minutes={arrivalTime?.minutes || 0}
                            onDismiss={() => setArrivalVisible(false)}
                            onConfirm={({ hours, minutes }) => {
                                setArrivalTime({ hours, minutes })
                                setArrivalVisible(false)
                            }}
                        label="Select time"/>
                        </View>
                </View>
                <View style = {styles.break}>
                    <View style = {styles.halfScreen}>
                        <Text style = {styles.formText}>Travel Time</Text>
                    </View>
                    <View style = {styles.halfScreen}>
                        <Button color={'#D82732'} onPress={() => setTravelVisible(true)} title = {String(travelTime.hours).padStart(1, '0') + " hours " + String(travelTime.minutes).padStart(1, '0') + " mins"}/>
                    

                        <TimePickerModal
                        visible={travelVisible}
                        hours={travelTime?.hours || 0}
                        minutes={travelTime?.minutes || 0}
                        onDismiss={() => setTravelVisible(false)}
                        onConfirm={({ hours, minutes }) => {
                            setTravelTime({ hours, minutes })
                            setTravelVisible(false)
                        }}
                        label="Select duration"/>
                </View>
                </View>
            <Button title = "Add Time" color={'#D82732'} onPress = {processForm} />
        </View>
        <View style = {styles.hr}/>
    </>)
}

const styles = StyleSheet.create({
    container: {
        height: '40%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    hr: {
        width: '60%',
        height: 0,
        borderColor: '#605F5F',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        alignSelf: "center",
    },

    break:{
        width: '100%',
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center'
    },

    formText: {
        fontFamily: 'Bree Serif',
        fontSize: 14,
        color: '#013564',
        fontWeight: 'bold',
    },

    halfScreen: {
        width: '50%',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});