import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import FoodsScreen from "./src/screens/FoodsScreen";
import MealLogScreen from "./src/screens/MealLogScreen";
import MealPlanScreen from "./src/screens/MealPlanScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import ChatScreen from "./src/screens/ChatScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { getToken } from "./src/api/auth";
import { colors } from "./src/theme";

const Drawer = createDrawerNavigator();

const ICONS: Record<string, string> = {
    "Početna": "🏠",
    "Namirnice": "🍎",
    "Dnevnik": "📖",
    "Plan": "🍱",
    "Skener": "📷",
    "AI asistent": "🤖",
    "Profil": "👤",
};

function drawerIcon(name: string) {
    return () => <Text style={{ fontSize: 20 }}>{ICONS[name]}</Text>;
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        getToken().then((t) => setLoggedIn(!!t)).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
                <ActivityIndicator size="large" color={colors.olive} />
            </View>
        );
    }

    if (!loggedIn) {
        return (
            <>
                <StatusBar style="dark" />
                <LoginScreen onLogin={() => setLoggedIn(true)} />
            </>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="dark" />
            <Drawer.Navigator
                screenOptions={{
                    headerTintColor: colors.oliveDark,
                    headerTitleStyle: { fontWeight: "800" },
                    drawerActiveTintColor: colors.oliveDark,
                    drawerActiveBackgroundColor: colors.oliveSoft,
                    drawerInactiveTintColor: colors.text,
                    drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
                }}
            >
                <Drawer.Screen name="Početna" component={DashboardScreen} options={{ drawerIcon: drawerIcon("Početna") }} />
                <Drawer.Screen name="Namirnice" component={FoodsScreen} options={{ drawerIcon: drawerIcon("Namirnice") }} />
                <Drawer.Screen name="Dnevnik" component={MealLogScreen} options={{ drawerIcon: drawerIcon("Dnevnik") }} />
                <Drawer.Screen name="Plan" component={MealPlanScreen} options={{ drawerIcon: drawerIcon("Plan") }} />
                <Drawer.Screen name="Skener" options={{ drawerIcon: drawerIcon("Skener") }}>
                    {(props) => <ScannerScreen {...props} onLogout={() => setLoggedIn(false)} />}
                </Drawer.Screen>
                <Drawer.Screen name="AI asistent" component={ChatScreen} options={{ drawerIcon: drawerIcon("AI asistent") }} />
                <Drawer.Screen name="Profil" options={{ drawerIcon: drawerIcon("Profil") }}>
                    {(props) => <ProfileScreen {...props} onLogout={() => setLoggedIn(false)} />}
                </Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
    );
}
