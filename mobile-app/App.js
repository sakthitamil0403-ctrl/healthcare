import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import BloodDonationScreen from './screens/BloodDonationScreen';
import BookAppointmentScreen from './screens/BookAppointmentScreen';
import MilkDonationScreen from './screens/MilkDonationScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BloodDonation" component={BloodDonationScreen} options={{ title: 'Blood Donors' }} />
        <Stack.Screen name="MilkDonation" component={MilkDonationScreen} options={{ title: 'Milk Bank' }} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book Doctor' }} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'System Overview' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
