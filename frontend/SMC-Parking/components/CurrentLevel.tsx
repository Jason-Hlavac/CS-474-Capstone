import { StyleSheet, View, Text, Image } from 'react-native';
import { ComponentText } from './ComponentText';
import { CurrentLevelBars } from './CurrentLevelBars';
import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
const ip = Constants.expoConfig?.extra?.serverIp;

export function CurrentLevel(){
    const [currLevel, setCurrLevel] = useState(5);
    const [isLoading, setIsLoading] = useState(true);
    const [noData, setNoData] = useState(false);
    useEffect(() =>{
        async function fetchTrafficLevel(){
            try{
                setIsLoading(true);
                const response = await fetch(ip + '/trafficLevel');
                const data = await response.json();
                setCurrLevel(data.trafficLevel);
            }catch (e){
                setNoData(true);
                console.log(e)
            }finally{
                setIsLoading(false);
                
            }
        }
        fetchTrafficLevel();
    }, []);
    if(isLoading){
        return(
        <View style = {styles.container}>
            <ComponentText displayText = { 'Current Traffic Level' }/>
            <View style = {styles.levelContainer}>
                <Image style = {styles.loadingImage} source = {require('../assets/images/loading.gif')}></Image>
            </View>
        </View>
        )
    }else if(noData){
        return(
            <View style = {styles.container}>
                <ComponentText displayText = { 'Current Level' }/>
                <View style = {styles.levelContainerCenter}>
                    <Text style = {styles.noDataText}>Could Not Retrieve Data</Text>
                </View>
            </View>
        )
    }else{
    const getText = () => {
        const text = ["No Traffic", "Slight Traffic", "Light Traffic", "Moderate Traffic", "Busy Traffic", "Heavy Traffic", "Very Heavy Traffic", "Extreme Traffic", "Standstill"];
        return(text[currLevel-1]);
    }
    return(<>
    <View style = {styles.container}>
        <ComponentText displayText = { 'Current Traffic Level' }/>
        <View style = {styles.levelContainer}>
            <CurrentLevelBars currLevel={currLevel} />
            <Text style = {styles.currLevelText}>{getText()}</Text>
        </View>
    </View>
    </>)
    }
}

const styles = StyleSheet.create({
    container: {
        height: '25%',
    },

    levelContainer: {
        margin: '2%',
        backgroundColor: '#D8E5F0',
        height: '60%',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 15,
    },

    levelContainerCenter: {
        margin: '2%',
        backgroundColor: '#D8E5F0',
        height: '60%',
        width: '80%',
        alignSelf: 'center',
        borderRadius: 15,
        alignContent: 'center',
        justifyContent: 'center',
    },

    currLevelText: {
        marginTop: '2%',
        fontFamily: 'Bree Serif',
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    },
    staticContainer: {
        width: '80%',
        display: 'flex',
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    
    loadingImage: {
        height: '100%',
        alignSelf: 'center',
        
    },
    noDataText: {
        fontFamily: 'Bree Serif',
        fontSize: 20,
        color: '#013564',
        fontWeight: 'bold',
        textAlign: 'center',
        alignSelf: 'center',
    }
})