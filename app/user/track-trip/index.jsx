import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import polyline from "polyline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const TrackScreen = () => {
  const [loading, setLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [distanceAndTime, setDistanceAndTime] = useState({
    distance: "",
    duration: "",
  });
  const [tripId, setTripId] = useState([]);
  const router = useRouter();

  const API_KEY = "AIzaSyAodAHhF0cQCPzP8rvmCFH-ttp2avSfxVs";
  const typeOfTravel = "driving";

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission denied");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const fetchDirections = async (origin, destination) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json`,
        {
          params: {
            origin: `${origin.latitude},${origin.longitude}`,
            destination: `${destination.latitude},${destination.longitude}`,
            key: API_KEY,
            mode: typeOfTravel,
            alternatives: true,
          },
        }
      );

      const route = response.data.routes[0];
      const distance = route.legs[0].distance.text;
      const duration = route.legs[0].duration.text;

      const points = polyline
        .decode(route.overview_polyline.points)
        .map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));

      setCoordinates(points);
      setDistanceAndTime({ distance, duration });
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const openGoogleMaps = () => {
    if (pickupLocation && dropoffLocation) {
      const origin = `${pickupLocation.latitude},${pickupLocation.longitude}`;
      const destination = `${dropoffLocation.latitude},${dropoffLocation.longitude}`;

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${typeOfTravel}`;

      Linking.openURL(url);
    } else {
      alert("Pickup or dropoff location not available.");
    }
  };

  const onTrip = () => {
    router.push({
      pathname: "/user/track-trip/TripDetails",
      params: { tripId },
    });
  };

  const emergencyAlert = () => {
    router.push("/(tabs)/(user)/alerts");
  };

  useEffect(() => {
    let subscription;

    const loadLocation = async () => {
      try {
        // Access AsyncStorage to get startedTrip
        const tripData = await AsyncStorage.getItem("startedTrip");
        const { pickupLocation, dropoffLocation, _id } = JSON.parse(tripData); // Parse the JSON data
        setTripId(_id);
        setPickupLocation(pickupLocation);
        setDropoffLocation(dropoffLocation);

        const currentLocation = await fetchCurrentLocation();
        await fetchDirections(pickupLocation, dropoffLocation);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 1,
          },
          async (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            await fetchDirections({ latitude, longitude }, dropoffLocation);
          }
        );
      } catch (error) {
        alert("No ongoing trips");
      } finally {
        setLoading(false);
      }
    };

    loadLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Function to calculate and set the region for auto-zoom
  const getMapRegion = () => {
    if (pickupLocation && dropoffLocation) {
      const latitudes = [pickupLocation.latitude, dropoffLocation.latitude];
      const longitudes = [pickupLocation.longitude, dropoffLocation.longitude];

      const southwest = {
        latitude: Math.min(...latitudes),
        longitude: Math.min(...longitudes),
      };
      const northeast = {
        latitude: Math.max(...latitudes),
        longitude: Math.max(...longitudes),
      };

      return {
        latitude: (southwest.latitude + northeast.latitude) / 2,
        longitude: (southwest.longitude + northeast.longitude) / 2,
        latitudeDelta: Math.abs(southwest.latitude - northeast.latitude) * 1.5, // Adjust zoom level
        longitudeDelta:
          Math.abs(southwest.longitude - northeast.longitude) * 1.5,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  const mapRegion = getMapRegion();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Track Trip</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Distance: {distanceAndTime.distance}
        </Text>
        <Text style={styles.infoText}>
          Duration: {distanceAndTime.duration}
        </Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={mapRegion} // Set initial region based on pickup and dropoff
      >
        {pickupLocation && (
          <Marker coordinate={pickupLocation} title="Pickup Location">
            <MaterialCommunityIcons
              name="map-marker"
              size={30}
              color="#9b5377"
            />
          </Marker>
        )}
        {dropoffLocation && (
          <Marker coordinate={dropoffLocation} title="Dropoff Location">
            <MaterialCommunityIcons
              name="map-marker-check-outline"
              size={30}
              color="#9b5377"
            />
          </Marker>
        )}
        {coordinates.length > 0 && (
          <Polyline
            coordinates={coordinates}
            strokeColor="#9b5377"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        {/* Button to open Google Maps with directions */}
        <TouchableOpacity style={styles.button} onPress={onTrip}>
          <Text style={styles.buttonText}>Trip Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openGoogleMaps}>
          <Text style={styles.buttonText}>Open in Google Maps</Text>
        </TouchableOpacity>
        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={emergencyAlert}
        >
          <Text style={styles.emergencyButtonText}>Emergency</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "bold",
    color: "#9b5377",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#9b5377",
  },
  map: {
    width: "100%",
    height: "70%",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#9b5377",
    padding: 15,
    borderRadius: 25,
    paddingVertical: 11,
    paddingHorizontal: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emergencyButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 25,
    paddingVertical: 11,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  emergencyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TrackScreen;
