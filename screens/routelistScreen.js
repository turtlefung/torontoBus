import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { getallroutes } from '../services/Api';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AdMobID_Banner } from './AdMobIDs';
import useKeyboard from './useKeyboard';

export default function RoutelistScreen({navigation}) {

  //change variables
  const [searchtext, setSearchtext] = useState()
  const [routes, setRoutes] = useState([])
  const [routesShow, setRoutesshow] = useState([])
  const isKeyboardOpen = useKeyboard()


  async function fetchroutes(){
    const response = await getallroutes()
    const parser = new XMLParser({ignoreAttributes : false});
    let obj = parser.parse(response);
    if (obj.body){
      if (obj.body.route){
        if (obj.body.route.length!=routes.length){
          setRoutes(obj.body.route)
          setRoutesshow(obj.body.route)
          AsyncStorage.setItem("routeList", JSON.stringify(obj.body.route))
        }
      }
    }
  }

  async function getroutelist(){
    const response = await AsyncStorage.getItem("routeList")
    if (response!=null){
      const parsedresponse = JSON.parse(response)
      setRoutes(parsedresponse)
      setRoutesshow(parsedresponse)
    }
  }

  function renderItem({item}){
    return(
      <TouchableOpacity onPress={() => {navigation.push("RouteDirectionScreen", {routeNumber: item["@_tag"], routeTitle: item["@_title"]})}}>
        <View style={styles.routebox}>
          <Text style={styles.routename}>{item["@_title"]}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    getroutelist()
    fetchroutes()
  },[])

  useEffect(() => {
          setRoutesshow(routes.filter(item => item["@_title"].substring(0,searchtext.length).toLowerCase().includes(searchtext.toLowerCase())       ))
  }, [searchtext])

  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
      <View style={styles.container}>
        <View>
          <Text style={{color: "white", textAlign: "center", fontSize: 22}}>Toronto Bus Time</Text>
          <TextInput
            style={styles.input}
            onChangeText={setSearchtext}
            placeholder="Search..."
          />
        </View>
        <View style={{paddingHorizontal: 8, backgroundColor: "white", flex: 1}}>
          <FlatList
            data={routesShow}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
        {isKeyboardOpen==false ? (Constants.isDevice && !__DEV__) ?
        <View style={{alignItems: "center", justifyContent: 'center', width: wp(100)}}>
          <BannerAd
            unitId={AdMobID_Banner}
            size={BannerAdSize.FULL_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
        :
        <View style={{alignItems: "center", backgroundColor: "white", borderWidth: 2, justifyContent: "center", paddingVertical: hp(3)}}>
          <Text>Testing Ads</Text>
        </View>
        :
        <View />
        }
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
