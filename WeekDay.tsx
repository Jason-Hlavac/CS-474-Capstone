import { StyleSheet, View, Text } from 'react-native';
import { ComponentText } from './ComponentText';
import { Header, styles } from '@/components/Header';
import { TrafficGraph } from './Barchart';

//Basic idea for rest of code
// date time and put the weekday code in a for loop with an array for each day
// use date time to change the style for the current day
// use a bar chart an include proxy data from anything in order to measure traffic
// say people leave to school at 6 am and people start heading home no later than 9/10/11/12 am? 
//bar chart will then have ~18 columns 

export function Day(){
    //Gets us the current day of week(probably a better way to write this)
    const currentDate = new Date();
    const weekDay = currentDate.getDay()
    const week = ['Sun', 'Mon' , 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    //starts with Sunday because getDay sees saturday as the sixth day of the week and arrays start at zero

    return(
        // <View style = {weekStyles.weekContainer}>
        //     {<Text style={weekStyles.weekText}>
        //         {week.map((day)) =>}
        //     </Text>}

        // </View>
        <>
        <View style = {weekStyles.weekContainer}>
        {
        week.map((day, index) => (
            index == weekDay ? <Text key = {day} style ={weekStyles.currentDay}>{day}</Text> : <Text key = {day} style ={weekStyles.weekText}>{day}</Text>
        ))
        }
      </View>
        <hr style={styles.hr}/>
        {/* <View style ={weekStyles.container}></View> */}
        <TrafficGraph></TrafficGraph>


    </>
    )

    //stuff to manipulate week day
    //event handle to see which day of the week it is
    //font color/under line Changes per day
    //Need another method of essentially creating a barchart in react. 

}

const weekStyles = StyleSheet.create({
    weekContainer: {
        // width: '100%',
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'flex-start',

    },
    weekText:{
        fontFamily: 'Bree Serif',
        margin: '2%',
        fontSize: 20,
        // color: '#800000',
        width:"100%",
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'flex-start',

    },
    container:{
        margin: "3%",
        alignSelf: "flex-start",
        justifyContent: "space-around",
        height: "20%",
        width: "90%",
        backgroundColor: "#d8e5f0",
        borderRadius: 15,
      },
      currentDay:{
        fontFamily: 'Bree Serif',
        margin: '2%',
        textDecorationLine: 'underline',
        fontSize: 20,
        color: '#800000',
        width:"100%",
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'flex-start',

      }
})


    // return(
    //     <>
    // <ComponentText displayText = { 'Traffic History' }/>
    // <View style = {weekStyles.weekContainer}>
    //     {/* {weekDay.toString()} */}
    //     {/* <Text style ={weekStyles.weekText}>
    //         Mon
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Tue
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Wed
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Thu
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Fri
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Sat
    //     </Text>
    //     <Text style ={weekStyles.weekText}>
    //         Sun
    //     </Text> */}
    // </View>
    // <hr style={styles.hr}/>

    // <View style ={weekStyles.container}></View>


    // </>
    // )
        //     for(let i = 0; i < week.length; i++){
    //         if (weekDay == i){
    //             <View style = {weekStyles.weekContainer}>
    //             {<Text style ={weekStyles.weekText}>
    //                 {weekDay}
    //                 {i}
    //             </Text>
    //             }
    //         </View>
    //             }
    //         else{
    //             //bug, return here ends the loop early 
    //             <View style = {weekStyles.weekContainer}>
    //             {<Text style ={weekStyles.weekText}>
    //                 {week[i]}
    //             </Text>
    //             }
    //         </View>
                
    //     }
        
    // }