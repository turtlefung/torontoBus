import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import * as StoreReview from 'expo-store-review';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AdMobID_Banner } from './AdMobIDs';

// You can import from local files
import { getarrivaltime } from '../services/Api';

export default function SavedlistScreen({navigation}) {

  //change variables
  const [savedlist, setSavedlist] = useState([])
  const [arrivaltimedict, setArrivaltimedict] = useState({})
  const [expandlist, setexpandlist] = useState([])
  const [extra, setExtra] = useState(1)
  

   async function savetosavedlist(routeNumber,title,tag){
    if ((savedlist.findIndex(itemy => ((itemy.routeNumber == routeNumber) && (itemy.title == title) && (itemy.tag == tag)))!=-1)) {
        const newsavelist = savedlist.filter(items => items!=savedlist[savedlist.findIndex(itemy => ((itemy.routeNumber == routeNumber) && (itemy.title == title) && (itemy.tag == tag)))])
        setSavedlist(newsavelist)
        AsyncStorage.setItem("savedlist", JSON.stringify(newsavelist))
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
    const unsubscribe = navigation.addListener('focus', () => {
      getsavedlist()
    });
    return unsubscribe;
  }, [navigation]);

  async function updatetime(){
      const temparrivaltimedict = {}
      for (let i =0 ; i < savedlist.length; i++){
        const response = await getarrivaltime(savedlist[i].routeNumber, savedlist[i].tag)
        const parser = new XMLParser({ignoreAttributes : false});
        let obj = parser.parse(response);
        const arrivaltime = Array.isArray(obj.body.predictions.direction) ? obj.body.predictions.direction.filter(item => item["@_title"] == savedlist[i].title).length>0 ? obj.body.predictions.direction.filter(item => item["@_title"] == savedlist[i].title)[0].prediction : [] : obj.body.predictions.direction.prediction
     
        temparrivaltimedict[savedlist[i].routeNumber+"@"+savedlist[i].title+"@"+savedlist[i].tag+"@"+savedlist[i].stopName] = arrivaltime
      }
      console.log(temparrivaltimedict)
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

function renderItem({item, index}){
    const today = new Date();
    const identifier = item.routeNumber+"@"+item.title+"@"+item.tag+"@"+item.stopName
    var direction = item.title.split(" ").slice(3, item.title.split(" ").length).join(" ")
    return(
      <TouchableOpacity onPress={() => {expandorcontrad(item.routeNumber, item.title, item.tag, item.stopName)}}>
        <View style={styles.routebox}>
          <View style={{flexDirection: "row"}}>
            <View style={{flex: 1}}>
              <Text style={styles.routename}>{item.stopName}</Text>
              <View style={{flexDirection: "row", overflow: "hidden"}}>
                <Text style={{color: "white", fontSize: wp(4), backgroundColor: "#D01A1E", width: wp(15), borderRadius: wp(3), textAlign: "center", fontWeight: "bold"}}>{item.routeNumber}</Text>
                <Text style={styles.routedest}>{direction}</Text>
              </View>
                {expandlist.includes(identifier) &&
                <View style={{marginLeft: wp(10), marginTop: hp(2)}}>
                  {Array.isArray(arrivaltimedict[identifier]) ? arrivaltimedict[identifier].map(item => <Text style={{fontSize: wp(5)}}>{item["@_minutes"]}<Text style={{fontSize: wp(3)}}> min</Text></Text>) : null}
                </View>
                }
            </View>
            <View style={{flexDirection: "column"}}>
              <TouchableOpacity onPress={() => savetosavedlist(item.routeNumber, item.title, item.tag)}>
                {(savedlist.findIndex(itemy => ((itemy.routeNumber == item.routeNumber) && (itemy.title == item.title) && (itemy.tag == item.tag)))!=-1)
                ?
                <MaterialCommunityIcons name="star" color={"orange"} size={wp(10)} />
                :
                <MaterialCommunityIcons name="star-outline" color={"darkgray"} size={wp(10)} />
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {expandorcontrad(item.routeNumber, item.title, item.tag, item.stopName)}}>
                  {expandlist.includes(identifier) ?
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

   async function expandorcontrad(routeNumber, title, tag, stopName){
    var identifier = routeNumber+"@"+title+"@"+tag+"@"+stopName
    if (expandlist.includes(identifier)){
      setexpandlist(expandlist.filter(iteme => iteme!=identifier))
    } else {
      setexpandlist(expandlist.concat(identifier))
      
      var response = await getarrivaltime(routeNumber, tag)
      const parser = new XMLParser({ignoreAttributes : false});
      let obj = parser.parse(response);
      const arrivaltime = Array.isArray(obj.body.predictions.direction) ? obj.body.predictions.direction.filter(item => item["@_title"] == title).length>0 ? obj.body.predictions.direction.filter(item => item["@_title"] == title)[0].prediction : [] : obj.body.predictions.direction.prediction
     
      var tempDict = arrivaltimedict
      tempDict[identifier] = arrivaltime
      setArrivaltimedict(tempDict)
      setExtra(extra+1)
    }
  }

  
  
  async function checkusagetime() {
    try {
        const storestring = StoreReview.storeUrl()
        var asyncusagetime = await AsyncStorage.getItem("usagetime")
        if (asyncusagetime == null) {
            AsyncStorage.setItem("usagetime", "1")
            return
        }

        var usagetime = JSON.parse(asyncusagetime)
        if (asyncusagetime == "3") {
            StoreReview.requestReview()
        } else {
            var newusagetime = usagetime+1
            AsyncStorage.setItem("usagetime", JSON.stringify(newusagetime))
        }
    } catch {
        console.log("error in opening review")
    }
  } 

  useEffect(() => {
    checkusagetime()
  },[])




  return (
    <View style={styles.container}>
      <View>
        <Text style={{color: "white", textAlign: "center", fontSize: 22}}>Saved list</Text>
      </View>
      <View style={{flex: 1, backgroundColor: "white"}}>
        {savedlist && savedlist.length>0 ?
        <FlatList
         data={savedlist}
         renderItem={(item) => renderItem(item)}
         style={{paddingHorizontal: 8}}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          extraData={extra}
         />
         :
         <View style={{justifyContent: "center", alignItems: "center", flex: 1}}>
          <Text>Your saved list is empty.</Text>
          <TouchableOpacity 
            style={{backgroundColor: "#D01A1E", borderRadius: wp(10), paddingVertical: hp(1), paddingHorizontal: wp(2), marginTop: hp(1)}}
            onPress={() => navigation.navigate("All Routes")}
            >
            <Text style={{color: "white"}}>Add new routes</Text>
          </TouchableOpacity>
         </View>
        }
      </View>
      {(Constants.isDevice && !__DEV__ && savedlist && savedlist.length>0) &&
        <View style={{alignItems: "center", justifyContent: 'center', width: wp(100)}}>
          <BannerAd
            unitId={AdMobID_Banner}
            size={BannerAdSize.FULL_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
        }
    </View>
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
    marginVertical: 3,
    borderWidth: 0,
    padding: 10,
    borderColor: "lightgray",
    backgroundColor: "white",
    borderRadius: 30,
    fontSize: 17
  },
  routebox:{
    marginVertical: hp(1),
    paddingHorizontal: 8,
    paddingBottom: hp(2),
    borderBottomColor: "lightgray",
    borderBottomWidth: 1
  },
  routename: {
    fontSize: wp(5),
    fontWeight: "bold"
  },
  routedest: {
    fontSize: wp(4),
    marginLeft: wp(2)
  }
});
