import React, { useState } from 'react';
import { StyleSheet, View, Button, Text} from 'react-native';
import { TimePickerModal } from 'react-native-paper-dates';
import {Picker} from '@react-native-picker/picker';

export function NotificationForm(){
    const [selectedDay, setSelectedDay] = useState('mon');
    const [arrivalTime, setArrivalTime] = useState({ hours: 12, minutes: 0 });
    const [arrivalVisible, setArrivalVisible] = useState(false);
    const isPM = arrivalTime.hours >= 12;
    const amOrPm = isPM ? 'PM' : 'AM';
    
    const [travelTime, setTravelTime] = useState({ hours: 0, minutes: 30 });
    const [travelVisible, setTravelVisible] = useState(false);
    function processForm(){
        console.log(selectedDay);
        console.log(arrivalTime);
        console.log(travelTime);
    }

    return(<>
        <View style = {styles.container}>
                <Picker selectedValue={selectedDay} onValueChange={(itemValue) => setSelectedDay(itemValue)}>
                    <Picker.Item label = 'Monday' value = 'mon'></Picker.Item>
                    <Picker.Item label = 'Tuesday' value = 'tues'></Picker.Item>
                    <Picker.Item label = 'Wednesday' value = 'wed'></Picker.Item>
                    <Picker.Item label = 'Thursday' value = 'thu'></Picker.Item>
                    <Picker.Item label = 'Friday' value = 'fri'></Picker.Item>
                    <Picker.Item label = 'Saturday' value = 'sat'></Picker.Item>
                    <Picker.Item label = 'Sunday' value = 'sun'></Picker.Item>
                </Picker>
            <View style = {styles.break}/>
                <View style = {styles.halfScreen}>
                    <Text style = {styles.formText}>Arrival Time</Text>
                </View>
                <View style = {styles.halfScreen}>
                    <Button color={'#D82732'} onPress={() => setArrivalVisible(true)} title = {String(arrivalTime.hours%12 || 12).padStart(2, '0') + ":" + String(arrivalTime.minutes).padStart(2, '0') + " " + amOrPm}/>
                </View>
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
                <View style = {styles.break}/>
                    <View style = {styles.halfScreen}>
                        <Text style = {styles.formText}>Travel Time</Text>
                    </View>
                    <View style = {styles.halfScreen}>
                        <Button color={'#D82732'} onPress={() => setTravelVisible(true)} title = {String(travelTime.hours).padStart(1, '0') + " hours " + String(travelTime.minutes).padStart(1, '0') + " mins"}/>
                    </View>
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
                <View style = {styles.break}/>
            <Button title = "Add Time" color={'#D82732'} onPress = {processForm} />
        </View>
        <View style = {styles.hr}/>
    </>)
}

const styles = StyleSheet.create({
    container: {
        height: '40%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexWrap: 'wrap',
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
        flexBasis: '100%',
        height: 0,
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