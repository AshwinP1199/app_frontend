import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "../../../../api/axios";

const AvailableProvidersScreen = () => {
  const [loading, setLoading] = useState(true); // Loading for initial fetch
  const [refreshing, setRefreshing] = useState(false); // Loading for refresh action
  const [currentLocation, setCurrentLocation] = useState(null);
  const [providers, setProviders] = useState([]);

  // Fetch current location
  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location permission denied. Please enable it in settings.");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // Fetch nearby providers
  const fetchProviders = async (userLocation) => {
    try {
      const response = await axios.get("/locations/providers", {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      });

      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setProviders(response.data.data); // Set providers from the data field
      } else {
        Alert.alert("Error", "Unexpected response structure received.");
      }
    } catch (error) {
      Alert.alert("Error", "No Nearby Providers Found! Try Again Later");
      setProviders([]); // Clear providers on error
    }
  };

  // Load location and providers for initial load or refresh
  const loadLocationAndProviders = async () => {
    setLoading(true); // Start loading animation
    const location = await fetchCurrentLocation();
    if (location) {
      setCurrentLocation(location);
      await fetchProviders(location);
    }
    setLoading(false);
    setRefreshing(false); // Stop refreshing after fetch
  };

  // Initial load on component mount
  useEffect(() => {
    loadLocationAndProviders(); // Load data initially on mount
  }, []);

  // Handler for refresh button
  const handleRefresh = () => {
    setRefreshing(true); // Show the refresh indicator
    loadLocationAndProviders(); // Reload location and providers
  };

  if (loading || refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* MapView with Providers */}
      <MapView
        style={{ width: "100%", height: "90%" }} // Adjust height to make space for the button
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {Array.isArray(providers) && providers.length > 0
          ? providers.map((provider) => (
              <Marker
                key={`${provider._id}-${provider.userName}`} // Ensure key is unique
                coordinate={{
                  latitude: provider.currentLocation.latitude,
                  longitude: provider.currentLocation.longitude,
                }}
                title={provider.userName}
              >
                <MaterialCommunityIcons
                  name="account-circle"
                  size={40}
                  color="#9b5377"
                />
              </Marker>
            ))
          : null}

        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
          >
            <MaterialCommunityIcons
              name="account-circle"
              size={40}
              color="#00f"
            />
          </Marker>
        )}
      </MapView>

      {/* Refresh Button */}
      <View style={styles.buttonContainer}>
        {refreshing ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Button title="Refresh Providers" onPress={handleRefresh} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
});

export default AvailableProvidersScreen;
