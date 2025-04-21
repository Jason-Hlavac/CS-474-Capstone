import { StyleSheet, View} from 'react-native';

export function CurrentLevelBars({ currLevel }: {currLevel : number}){
    const renderBars = () => {
        const elements = [];
        const maxBars = 9;
        for(let i = 1; i < currLevel; i++){
            elements.push(<View style = {styles.active} key = { i }/>)
        }
        elements.push(<View style = {styles.current} key = { currLevel }/>);
        for(let i = currLevel+1; i <= maxBars; i++){
            elements.push(<View style = {styles.inactive} key = { i }/>)
        }
        return(elements);
    }

    return(<>
        <View style = {styles.container}>
            {renderBars()}
        </View>
    </>)
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '50%',
        width: '70%',
        alignSelf: 'center',
    },

    active: {
        height: '50%',
        width: '4%',
        backgroundColor: '#D82732',
        borderRadius: 40,
    },

    inactive: {
        height: '50%',
        width: '4%',
        backgroundColor: '#605F5F',
        borderRadius: 40,
    },

    current: {
        height: '70%',
        width: '7%',
        backgroundColor: '#D82732',
        borderRadius: 40,
    },

})