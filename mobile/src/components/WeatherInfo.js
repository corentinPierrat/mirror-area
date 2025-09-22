import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingSpinner from './Loading';

export default function WeatherDisplay() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch('http://10.18.204.233:8080/get_weather')
      .then(res => res.json())
      .then(json => { if (isMounted) setData(json); })
      .catch(err => { if (isMounted) setData({ error: err.message }); });
    return () => { isMounted = false; };
  }, []);

  if (!data) {
    return (
      <View style={styles.container}>
        <LoadingSpinner size={45} color="gray" />
      </View>
    );
  }

  if (data.error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error : {data.error}</Text>
      </View>
    );
  }

  const time = new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.temp}>{data.temperature}°C</Text>
      <Text style={styles.wind}>Vent : {data.windspeed} km/h, {data.winddirection}°</Text>
      <Text style={styles.day}>{data.is_day ? 'Jour 🌞' : 'Nuit 🌙'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loading: {
    fontSize: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
  time: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  wind: {
    fontSize: 18,
    marginTop: 10,
  },
  day: {
    fontSize: 18,
    marginTop: 5,
  },
  code: {
    fontSize: 16,
    marginTop: 5,
  },
});
