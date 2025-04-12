import React, { useState } from 'react';
import { StyleSheet, View, ScrollView} from 'react-native';

const dummyData = [{day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}, {day: 'Tuesday', arrivalTime: { hours: 0, minutes: 30 }, travelTime: { hours: 0, minutes: 30 }}];

export function NotificationScroller(){
    const [notificationData, setNotificationData] = useState(dummyData);
    const rows = [];

    for(let i = 0; i < notificationData.length; i++){
        const isPM = notificationData[i].arrivalTime.hours >= 12;
        const amOrPm = isPM ? 'PM' : 'AM';
        rows.push(<>
            <View style = {styles.row}>
                <View style = {[styles.dayCol, styles.col]}>{notificationData[i]['day']}</View>
                <View style = {[styles.arriveCol, styles.col]}>{String(notificationData[i].arrivalTime.hours%12 || 12).padStart(2, '0') + ":" + String(notificationData[i].arrivalTime.minutes).padStart(2, '0') + " " + amOrPm}</View>
                <View style = {[styles.travelCol, styles.col]}>{notificationData[i]['travelTime'].hours + ':' +notificationData[i]['travelTime'].minutes}</View>
                <View style = {[styles.removeCol, styles.col]}>Remove</View>
                <View style = {styles.paddingCol}></View>
            </View>
            </>)

    }

    return(<>
        <View style = {styles.container}>
            <View style = {styles.header}>
                <View style = {[styles.dayCol, styles.col]}>Day</View>
                <View style = {[styles.arriveCol, styles.col]}>Time Arriving</View>
                <View style = {[styles.travelCol, styles.col]}>Travel Time</View>
                <View style = {[styles.removeCol, styles.col]}>Remove</View>
                <View style = {styles.paddingCol}></View>
            </View>

            <ScrollView style = {styles.scrollable}>
                {rows}

            </ScrollView>
        </View>
    </>)
}


const styles = StyleSheet.create({
    container: {
        height: '40%',
        marginTop: '2%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    header: {
        backgroundColor: '#D8E5F0',
        width: '100%',
        height: '10%',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '2%',
    },

    row:{
        width: '100%',
        height: '25%',
        display: 'flex',
        flexDirection: 'row',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },

    scrollable:{
        width: '100%',
        height: '88%',
        backgroundColor: '#D8E5F0',
        display: 'flex',
        flexDirection: 'column',
    },

    col: {
        borderRightColor: 'black',
        borderRightWidth: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    dayCol: {
        width: '15%',
    },

    arriveCol: {
        width: '30%',
    },

    travelCol: {
        width: '30%',
    },

    removeCol: {
        width: '20%',
    },

    paddingCol: {
        width: '5%',
    },



})