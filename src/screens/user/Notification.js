import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';

const Notification = () => {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header
        title="Notifications"
        leftType="back"
        onLeftPress={() => {
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
export default Notification;