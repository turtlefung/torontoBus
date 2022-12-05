import * as React from 'react';
import {useEffect, useState, useRef} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import MapView, { Marker, Polyline } from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getstops } from '../services/Api';

// You can import from local files
import { getarrivaltime } from '../services/Api';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';

export default function RoutedetailsScreen({navigation, route}) {

  //static variables
  const line = route.params.line
  const direction = route.params.direction
  const originationName = route.params.originationName
  const destinationName = route.params.destinationName

  
  const routeNumber = route.params.routeNumber
  const allStops = route.params.allStops
  const stop = route.params.stop
  const title = route.params.title
  const mapRef = useRef()

  //state variables
  const [routeStop, setRouteStop] = useState([])
  const [arrivaltimedict, setArrivaltimedict] = useState({})
  const [extra, setExtra] = useState(1)
  const [savedlist, setSavedlist] = useState([])
  const [expandlist, setexpandlist] = useState([])
  const [startlat, setStartlat] = useState()
  const [startlong, setStartlong] = useState()
  const [coordinatelist, setCoordinatelist] = useState([])

  async function savetosavedlist(tag){
    if ((savedlist.findIndex(itemy => ((itemy.routeNumber == routeNumber) && (itemy.title == title) && (itemy.tag == tag)))!=-1)) {
        const newsavelist = savedlist.filter(items => items!=savedlist[savedlist.findIndex(itemy => ((itemy.routeNumber == routeNumber) && (itemy.title == title) && (itemy.tag == tag)))])
        setSavedlist(newsavelist)
        AsyncStorage.setItem("savedlist", JSON.stringify(newsavelist))
      } else {
        const tempobjecttosave = {
          "routeNumber": routeNumber, 
          "title": title,
          "tag": tag,
          "stopName": allStops.filter(itemx => itemx["@_tag"] == tag)[0]["@_title"]
        }

        const existingobjectlistasync = await AsyncStorage.getItem("savedlist")
        if (existingobjectlistasync != null) {
          var existingobjectlist = JSON.parse(existingobjectlistasync)
        } else {
          var existingobjectlist = []
        }
        if (existingobjectlist.includes(tempobjecttosave) == false){
          const newobjectlist = existingobjectlist.concat(tempobjecttosave)
          AsyncStorage.setItem("savedlist", JSON.stringify(newobjectlist))
          setSavedlist(newobjectlist)
        }
      }
  }

  
  async function getsavedlist(){
    const response = await AsyncStorage.getItem("savedlist")
    if (response!=null){
      const parsedresponse = JSON.parse(response)
      setSavedlist(parsedresponse)
    }
  }

  useEffect(() => {
    getsavedlist()
  },[])

  async function expandorcontrad(tag){
    if (expandlist.includes(tag)){
      setexpandlist(expandlist.filter(iteme => iteme!=tag))
      mapRef.current.animateToRegion({
                latitude: startlat, 
                longitude: startlong,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              })
    } else {
      setexpandlist(expandlist.concat(tag))
      mapRef.current.animateToRegion({
                latitude: parseFloat(allStops.filter(item => item["@_tag"] == tag)[0]["@_lat"]),
                longitude: parseFloat(allStops.filter(item => item["@_tag"] == tag)[0]["@_lon"]),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
              })
      
      
      const response = await getarrivaltime(routeNumber, tag)
      const parser = new XMLParser({ignoreAttributes : false});
      let obj = parser.parse(response);
      const arrivaltime = Array.isArray(obj.body.predictions.direction) ? obj.body.predictions.direction.filter(item => item["@_title"] == title).length>0 ? obj.body.predictions.direction.filter(item => item["@_title"] == title)[0].prediction : [] : obj.body.predictions.direction.prediction
      var tempDict = arrivaltimedict
      tempDict[tag] = arrivaltime
      setArrivaltimedict(tempDict)
      setExtra(extra+1)
    }
  }

  function renderItem({item, index}){
    return(
      <TouchableOpacity onPress={() => {expandorcontrad(item["@_tag"])}}>
        <View style={styles.routebox}>
          <View style={{flexDirection: "row"}}>
            <View style={{flex: 1}}>
              <Text style={styles.routename}>{index+1}. {allStops.filter(itemx => itemx["@_tag"] == item["@_tag"])[0]["@_title"]}</Text>
              
              {expandlist.includes(item["@_tag"]) &&
              <View style={{marginLeft: wp(10), marginTop: hp(2)}}>
                {Array.isArray(arrivaltimedict[item["@_tag"]]) ? arrivaltimedict[item["@_tag"]].map(item => <Text style={{fontSize: wp(5)}}>{item["@_minutes"]}<Text style={{fontSize: wp(3)}}> min</Text></Text>) : null}
              </View>
              }
            </View>
            <View style={{flexDirection: "column"}}>
              <TouchableOpacity onPress={() => savetosavedlist(item["@_tag"])}>
                {(savedlist.findIndex(itemy => ((itemy.routeNumber == routeNumber) && (itemy.title == title) && (itemy.tag == item["@_tag"])))!=-1)
                ?
                <MaterialCommunityIcons name="star" color={"orange"} size={wp(10)} />
                :
                <MaterialCommunityIcons name="star-outline" color={"darkgray"} size={wp(10)} />
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {expandorcontrad(item["@_tag"])}}>
                  {expandlist.includes(item["@_tag"]) ?
                  <MaterialCommunityIcons name="chevron-up" color="black" size={wp(10)} />
                  :
                  <MaterialCommunityIcons name="chevron-down" color="black" size={wp(10)} />
                  }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  async function setroutedata(){
    const stop1 = allStops[0]
    console.log(stop1)
    setStartlat(parseFloat(stop1["@_lat"]))
    setStartlong(parseFloat(stop1["@_lon"]))
    setCoordinatelist(allStops.map(item => ({latitude: parseFloat(item["@_lat"]), longitude: parseFloat(item["@_lon"])})))
  }

  useEffect(()=> {
    setroutedata()
  },[])
  
  async function updatetime(){
    const listofstopseqtoupdate = Object.keys(arrivaltimedict)
    const temparrivaltimedict = {}
    for (let i =0 ; i < listofstopseqtoupdate.length; i++){
      const response = await getarrivaltime(routeNumber, listofstopseqtoupdate[i])
      const parser = new XMLParser({ignoreAttributes : false});
      let obj = parser.parse(response);
      const arrivaltime = Array.isArray(obj.body.predictions.direction) ? obj.body.predictions.direction.filter(item => item["@_title"] == title).length>0 ? obj.body.predictions.direction.filter(item => item["@_title"] == title)[0].prediction : [] : obj.body.predictions.direction.prediction
      temparrivaltimedict[listofstopseqtoupdate[i]] = arrivaltime
    }
    setArrivaltimedict(temparrivaltimedict)
  }

  
  const MINUTE_MS = 60000;

  useEffect(() => {
    if(arrivaltimedict) {
      let interval = setInterval(() => {
        updatetime()
      }, MINUTE_MS);
      return () => clearInterval(interval)
    } 
  }, [arrivaltimedict])

  useEffect(() => {
    updatetime()
  },[savedlist])

  return (
    <View style={styles.container}>
      <View style={{flexDirection: "row"}}>
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" color="white" size={40} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 3, flexDirection: "column"}}>
          <View style={{alignItems: "center", backgroundColor: "white", borderRadius: 20, alignSelf: "center", marginTop: 10, paddingHorizontal: 10}}>
            <Text style={{textAlign: "center", fontSize: 20, color: "#345cb4"}}>{routeNumber}</Text>
          </View>
        </View>
        <View style={{flex: 1}} />
      </View>
      <Text style={{textAlign: "center", fontSize: 20, marginTop: 2, color: "white", paddingHorizontal: wp(5)}}>
        {title}
      </Text>
      {startlat && startlong &&
      <MapView 
              ref={mapRef}
              style={{width: wp(100), height: hp(30)}}
              initialRegion={{
                latitude: startlat, 
                longitude: startlong,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              
              >
          {coordinatelist.map((item, index) => (
              <Marker
              key={index}
              coordinate={item}
              />
            ))}
          <Polyline 
            coordinates={coordinatelist}
            strokeWidth={4}
            strokeColor="#345cb4"
          />
      </MapView>
      }
      <View style={{flex:1, backgroundColor: "white", paddingHorizontal: 8}}>
        <FlatList
          data={stop}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          extraData={extra}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#D01A1E',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: "lightgray"
  },
  routebox:{
    marginVertical: 10,
    paddingHorizontal: 8,
    borderBottomColor: "lightgray",
    borderBottomWidth: 1,
    paddingBottom: hp(0.5),
  },
  routename: {
    fontSize: 20
  },
  routedest: {
    fontSize: 15
  },
  time: {
    fontSize: 20,
    color: "#545454"
  }
});
