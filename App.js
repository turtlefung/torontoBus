import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import RoutelistScreen from './screens/routelistScreen'
import RoutedetailsScreen from './screens/routedetailsScreen'
import SavedlistScreen from './screens/savedlist'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import RouteDirectionScreen from './screens/routeDirectionScreen'

function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

const RouteStack = createStackNavigator();

function Route() {
  return (
    <RouteStack.Navigator screenOptions={{headerShown: false}}>
      <RouteStack.Screen 
        name="RoutelistScreen" 
        component={RoutelistScreen}
        options={{
          title: 'All routes',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <RouteStack.Screen 
        name="RoutedetailsScreen" 
        component={RoutedetailsScreen} 
        options={{
          title: 'Details',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <RouteStack.Screen 
        name="RouteDirectionScreen" 
        component={RouteDirectionScreen} 
        options={{
          title: 'Directions',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </RouteStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();



export default function App() {

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          "tabBarActiveTintColor": "white",
          "tabBarInactiveTintColor": "darkgray",
          "tabBarActiveBackgroundColor": "#D01A1E",
          "tabBarInactiveBackgroundColor": "#D01A1E",
          "tabBarLabelStyle": 15,
          "tabBarHideOnKeyboard": true,
          "tabBarStyle": [
            {
              "display": "flex",
              "backgroundColor": "#D01A1E",
              "borderTopColor": "#D01A1E",
            },
            null
          ],
        }}
      >
        <Tab.Screen 
          name="Saved List" 
          component={SavedlistScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="content-save" color={color} size={size} />
              ),
          }} 
        />
        <Tab.Screen 
          name="All Routes" 
          component={Route}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="clock-time-eight" color={color} size={size} />
              ),
            
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}