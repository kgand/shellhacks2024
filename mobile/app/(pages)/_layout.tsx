import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Menu from '@/components/Menu';
import SubjectDetails from '@/components/SubjectDetails';
import CreateNote from '@/components/CreateNote';
import Query from '@/components/Query';
import QueryResults from '@/components/QueryResults';

const Stack = createStackNavigator();

export default function PageLayout() {
    return(
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Menu" component={Menu} />
            <Stack.Screen name="SubjectDetails" component={SubjectDetails} />
            <Stack.Screen name="CreateNote" component={CreateNote} />
            <Stack.Screen name="Query" component={Query} />
            <Stack.Screen name="QueryResults" component={QueryResults} />
        </Stack.Navigator>
    )
}