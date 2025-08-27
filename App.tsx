import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import SquadPlayers from "./screens/SquadPlayers";
import SplashScreen from "./screens/Splash";
import Setting from "./screens/Setting";
import Tickets from "./screens/Tickets";
import Matches from "./screens/Matches";
import Camara from "./screens/Camara";
import Gift from "./screens/Gift";
import News from "./screens/News";
import FanZone from "./screens/FanZone";
import Statistics from "./screens/Statistics";
import Profile from "./screens/Profile";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// ✅ Enhanced Tabs with proper Barcelona theming
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IoniconName = 'home-outline';

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Matches") {
            iconName = focused ? "football" : "football-outline";
          } else if (route.name === "Tickets") {
            iconName = focused ? "pricetag" : "pricetag-outline";
          } else if (route.name === "SquadPlayers") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Gift") {
            iconName = focused ? "bag" : "bag-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#004D98", // FC Barcelona blue
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          paddingBottom: 4,
        },
        tabBarStyle: {
          height: 65,
          paddingVertical: 8,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E7",
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ 
          headerShown: false,
          title: "Home"
        }}
      />
      <Tab.Screen
        name="Matches"
        component={Matches}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Tickets"
        component={Tickets}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="SquadPlayers"
        component={SquadPlayers}
        options={{ headerShown: false, title: "Squad" }}
      />
      <Tab.Screen
        name="Gift"
        component={Gift}
        options={{ 
          headerShown: false, 
          title: "Store"
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ Main Drawer navigation with Barcelona theming
function MainDrawer() {
  return (
    <Drawer.Navigator 
      initialRouteName="MainTabs"
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f8f9fa',
          width: 280,
        },
        drawerActiveBackgroundColor: '#004D98',
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#004D98',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ 
          title: "FC Barcelona",
          drawerLabel: "Home",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Setting" 
        component={Setting}
        options={{
          title: "Settings",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Tickets" 
        component={Tickets}
        options={{
          title: "Match Tickets",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "pricetag" : "pricetag-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Matches" 
        component={Matches}
        options={{
          title: "Fixtures",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "football" : "football-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="SquadPlayers" 
        component={SquadPlayers}
        options={{
          title: "Squad Players",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Camara" 
        component={Camara}
        options={{
          title: "Camera",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "camera" : "camera-outline"} size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="News" 
        component={News}
        options={{
          title: "News & Updates",
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SplashScreen onLoad={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        {/* Main app with drawer navigation */}
        <Stack.Screen name="Main" component={MainDrawer} />
        <Stack.Screen name="News" component={News} />
        <Stack.Screen name="FanZone" component={FanZone} />
        <Stack.Screen name="Statistics" component={Statistics} />
        <Stack.Screen name="Profile" component={Profile}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;