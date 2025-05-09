import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import { Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";

const CurrentLocationScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState(""); // State to store the address

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Reverse geocode the location to get the address
      const addressData = await Location.reverseGeocodeAsync(location.coords);
      if (addressData.length > 0) {
        console.log(addressData);
        // Join the address components into a readable format
        const addressString = `${addressData[0].street}, ${addressData[0].city}, ${addressData[0].region}, ${addressData[0].country}`;
        setAddress(addressString); // Set the address state
      }
    };

    fetchCurrentLocation();
  }, []);

  const handleSendLocation = () => {
    if (currentLocation) {
      const locationUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`;
      const whatsappUrl = `whatsapp://send?text=Here is my current location: ${locationUrl}\nAddress: ${address}`;

      Linking.openURL(whatsappUrl)
        .then(() => console.log("WhatsApp opened"))
        .catch((error) => console.error("Error opening WhatsApp:", error));
    } else {
      Alert.alert("Location not available yet!");
    }
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
          />
        </MapView>
      )}
      <Text style={styles.title}>Send Current Location via WhatsApp</Text>
      {currentLocation ? (
        <>
          <Text style={styles.locationText}>
            Current Location: {currentLocation.latitude},{" "}
            {currentLocation.longitude}
          </Text>
          <Text style={styles.locationText}>Address: {address}</Text>
        </>
      ) : (
        <Text style={styles.locationText}>Fetching location...</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSendLocation}>
        <Text style={styles.buttonText}>Send Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 50,
  },
  button: {
    padding: 15,
    backgroundColor: "#9b5377",
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  map: {
    width: "100%",
    height: 200, // Set height for the map
    marginBottom: 20, // Add some space below the map
  },
});

export default CurrentLocationScreen;
