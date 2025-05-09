import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "polyline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "../../../api/axios"; // Ensure your axios instance is set up correctly
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const TrackScreen = () => {
  const route = useRoute();
  const { tripId } = route.params;
  const [loading, setLoading] = useState(true);
  const [pickupLocation, setPickupLocation] = useState(null); // Current Location
  const [dropoffLocation, setDropoffLocation] = useState(null); // Destination
  const [coordinates, setCoordinates] = useState([]);
  const [distanceAndTime, setDistanceAndTime] = useState({
    distance: "",
    duration: "",
  });
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [user, setUser] = useState();

  const API_KEY = "AIzaSyAodAHhF0cQCPzP8rvmCFH-ttp2avSfxVs";
  const typeOfTravel = "driving";

  // Request and get the user's current location
  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission denied");
      return null; // Return null if permission is not granted
    }
    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // Fetch directions from Google Maps API
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
      console.error("Error fetching directions:", error.message);
    }
  };

  // Open Google Maps for navigation
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

  // Call provider (if necessary, add your logic here)
  const callProvider = async () => {
    try {
      const userId = trip?.userId; // Get userId from the trip object
      const res = await axios.get(`/user/${userId}`);
      const mobileNo = res.data.data?.user.mobileNo;

      if (mobileNo) {
        // Open the phone dialer with the mobile number
        const url = `tel:${mobileNo}`;
        const supported = await Linking.canOpenURL(url);

        if (supported) {
          Linking.openURL(url);
        } else {
          alert("Unable to open dialer.");
        }
      } else {
        alert("Mobile number is not available.");
      }
    } catch (error) {
      alert("Error fetching provider data:", error.message);
    }
  };

  // Start trip logic
  const startTrip = async () => {
    try {
      const res = await axios.put(`/trip-request/${tripId}/status`, {
        status: "started",
        providerId: user?._id,
      });
      router.push("/user/track-trip/TrackProvider");
    } catch (error) {}
  };

  // Store trip data in AsyncStorage
  const storeTripData = async (tripData) => {
    try {
      const jsonValue = JSON.stringify(tripData);
      await AsyncStorage.setItem("tripDetails", jsonValue);
      console.log("Trip data saved successfully");
    } catch (e) {
      console.error("Failed to save trip data:", e.message);
    }
  };

  useEffect(() => {
    let subscription;

    const loadLocation = async () => {
      try {
        const res = await axios.get(`/trip-request/get-trip/${tripId}`);
        const pickUpRequest = res.data.data?.tripRequest.pickupLocation;
        const tripDetails = res.data.data?.tripRequest;

        // Store trip data in AsyncStorage
        await storeTripData(tripDetails);
        setTrip(tripDetails);

        // Set dropoffLocation if it exists
        if (pickUpRequest) {
          setDropoffLocation(pickUpRequest);
        } else {
          console.error("Dropoff location not found in trip data.");
          return;
        }

        // Fetch current location and set it as pickupLocation
        const currentLocation = await fetchCurrentLocation();
        if (currentLocation) {
          setPickupLocation(currentLocation);
          // Check if dropoffLocation is set before calling fetchDirections
          if (pickUpRequest) {
            await fetchDirections(currentLocation, pickUpRequest);
          }
        } else {
          console.error("Unable to fetch current location.");
          return;
        }

        // Watch for location changes
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 1,
          },
          async (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            // Check if dropoffLocation is set before calling fetchDirections
            if (pickUpRequest) {
              await fetchDirections({ latitude, longitude }, pickUpRequest);
            }
          }
        );
        const getUser = async () => {
          try {
            const res = await axios.get("auth/current-user");
            setUser(res.data.data);
            console.log("user", res.data.data._id);
          } catch (error) {
          } finally {
            setLoading(false);
          }
        };
        getUser();
      } catch (error) {
        alert("No ongoing trips");
      } finally {
        setLoading(false);
      }
    };

    loadLocation();

    return () => {
      // Cleanup function to remove subscription
      if (subscription) {
        subscription.remove();
      }
    };
  }, [tripId]); // Add tripId as a dependency

  // Calculate and set the region for auto-zoom
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
    return null; // Return null if either location is not set
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
      <Text style={styles.title}>Find User</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Distance: {distanceAndTime.distance}
        </Text>
        <Text style={styles.infoText}>
          Duration: {distanceAndTime.duration}
        </Text>
      </View>
      <MapView style={styles.map} initialRegion={mapRegion}>
        {pickupLocation && (
          <Marker coordinate={pickupLocation} title="My Location">
            <MaterialCommunityIcons
              name="map-marker"
              size={30}
              color="#9b5377"
            />
          </Marker>
        )}
        {dropoffLocation && (
          <Marker coordinate={dropoffLocation} title="Pickup Location">
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
        <TouchableOpacity style={styles.button} onPress={openGoogleMaps}>
          <Text style={styles.buttonText}>Open Google Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={callProvider}>
          <Text style={styles.buttonText}>Call User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={startTrip}>
          <Text style={styles.buttonText}>Start Trip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    marginHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
  },
  map: {
    flex: 1,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#9b5377",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default TrackScreen;
