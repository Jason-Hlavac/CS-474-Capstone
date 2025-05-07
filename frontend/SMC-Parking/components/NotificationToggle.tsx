import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';



export function NotificationToggle({ isNotificationToggled, setIsNotificationToggled }: { isNotificationToggled: boolean, setIsNotificationToggled: React.Dispatch<React.SetStateAction<boolean>> }){
    function toggleSwitch(){
        setIsNotificationToggled((isNotificationToggled: boolean) => !isNotificationToggled);
    }

    return(<>
        <View style = {styles.container}>
            <Text style = {styles.notificationText}>Recieve Notifications</Text>
            <Switch trackColor={{false:'#D8E5F0', true: '#D8E5F0'}} thumbColor={isNotificationToggled ? '#1dad44' : '#D82732'} onValueChange = {toggleSwitch} value = {isNotificationToggled}></Switch>
        </View>
        <View style = {styles.hr} />
    </>)
    }

const styles = StyleSheet.create({
    container: {
        height: '8%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },

    notificationText: {
        fontFamily: 'Bree Serif',
        fontSize: 16,
        color: '#013564',
        fontWeight: 'bold',
    },

    hr: {
        width: '60%',
        height: 0,
        borderColor: '#605F5F',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        alignSelf: "center",
    },
});