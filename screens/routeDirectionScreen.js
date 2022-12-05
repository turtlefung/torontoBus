import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// You can import from local files
import { getdirection } from '../services/Api';
export default function RouteDirectionScreen({navigation, route}) {

  const routeNumber = route.params.routeNumber
  const routeTitle = route.params.routeTitle

  //change variables
  const [allStops, setAllStops] = useState([])
  const [directionsShow, setDirectionsshow] = useState([])


  async function fetchdirection(){
    const response = await getdirection(routeNumber)
    const parser = new XMLParser({ignoreAttributes : false});
    let obj = parser.parse(response);
    setDirectionsshow(obj.body.route.direction)
    setAllStops(obj.body.route.stop)
  }


  function renderItem({item}){
    return(
      <TouchableOpacity onPress={() => {navigation.push("RoutedetailsScreen", {routeNumber: routeNumber, allStops: allStops, stop: item.stop, title: item["@_title"]})}}>
        <View style={styles.routebox}>
          <Text style={styles.routename}>{item["@_title"]}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    fetchdirection()
  },[])

  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
      <View style={styles.container}>
        <View style={{flexDirection: "row", paddingBottom: hp(2)}}>
          <View style={{flex: 1}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="chevron-left" color="white" size={40} />
            </TouchableOpacity>
          </View>
          <View style={{flex: 3, flexDirection: "column"}}>
            <View style={{alignItems: "center", backgroundColor: "white", borderRadius: 20, alignSelf: "center", marginTop: 10, paddingHorizontal: 10}}>
              <Text style={{textAlign: "center", fontSize: 20, color: "#345cb4"}}>{routeTitle}</Text>
            </View>
          </View>
          <View style={{flex: 1}} />
        </View>
        <View style={{paddingHorizontal: 8, backgroundColor: "white", flex: 1}}>
          <FlatList
            data={directionsShow}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#D01A1E",
  },
  input: {
    marginHorizontal: 12,
    marginVertical: hp(2),
    borderWidth: 0,
    padding: 10,
    borderColor: "lightgray",
    backgroundColor: "white",
    borderRadius: 30,
    fontSize: 17
  },
  routebox:{
    marginVertical: 10,
    paddingHorizontal: 8,
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
  },
  routename: {
    fontSize: wp(6),
    fontWeight: "bold",
    marginBottom: hp(1)
  },
  routedest: {
    fontSize: wp(4)
  }
});
