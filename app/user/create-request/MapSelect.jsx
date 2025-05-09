import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../../../api/axios";
import { useRouter } from "expo-router";

const GOOGLE_API_KEY = "AIzaSyAodAHhF0cQCPzP8rvmCFH-ttp2avSfxVs";

const MapScreen = () => {
  const [region, setRegion] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tripRequest, setTripRequest] = useState();
  const router = useRouter();
  const [noProvider, setNotProvider] = useState(false);

  useEffect(() => {
    const getRequest = async () => {
      const tripReq = await AsyncStorage.getItem("tripRequest");
      const tripReqParsed = JSON.parse(tripReq);
      setTripRequest(tripReqParsed);
    };
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMarkerPosition({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
    getRequest();
  }, []);

  const handleConfirmLocation = async () => {
    if (selectedLocation) {
      const dropName = await Location.reverseGeocodeAsync(selectedLocation);
      const addressString = `${dropName[0].street}, ${dropName[0].city}, ${dropName[0].region}, ${dropName[0].country}`;
      alert(`Location confirmed: ${JSON.stringify(addressString)}`);
      tripRequest.dropoffLocation.latitude = selectedLocation.latitude;
      tripRequest.dropoffLocation.longitude = selectedLocation.longitude;
      tripRequest.dropoffLocation.name = addressString;
      try {
        const response = await axios.post("/trip-request", tripRequest);
        const tripId = response.data.data?.tripRequest._id;
        console.log(response.data.data?.tripRequest._id);
        router.push({
          pathname: "/user/create-request/LoadingProvider",
          params: { tripId: tripId },
        });
      } catch (error) {
        console.log("error", error);
        alert(
          error.response?.data.message ??
            "Failed to create trip request. Please try again."
        );
        setNotProvider(true);
      }
    } else {
      alert("No location selected!");
    }
  };

  const centerMapOnCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    setMarkerPosition(newRegion);
    setSelectedLocation(newRegion);
  };

  return (
    <View style={styles.container}>
      {/* Google Places Autocomplete Search */}
      <GooglePlacesAutocomplete
        placeholder="Please Enter Destination"
        fetchDetails={true}
        GooglePlacesSearchQuery={{
          rankby: "distance",
        }}
        onPress={(data, details = null) => {
          const { lat, lng } = details.geometry.location;
          const newRegion = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          setMarkerPosition(newRegion);
          setSelectedLocation(newRegion);
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: "en",
        }}
        styles={{
          container: {
            position: "absolute",
            width: "90%",
            top: 10,
            alignSelf: "center",
            zIndex: 1,
          },
          textInputContainer: {
            backgroundColor: "#fff",
            borderRadius: 20,
            paddingHorizontal: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          },
          textInput: {
            height: 44,
            backgroundColor: "#fff",
            borderRadius: 20,
            paddingLeft: 10,
          },
          listView: { backgroundColor: "white" },
        }}
        renderRightButton={() => (
          <Ionicons
            name="search-outline"
            size={24}
            color="black"
            style={{ padding: 10 }}
          />
        )}
      />

      {/* Map View */}
      <MapView
        style={styles.map}
        region={region}
        onPress={(e) => {
          setMarkerPosition(e.nativeEvent.coordinate);
          setSelectedLocation(e.nativeEvent.coordinate); // Set location on map press
        }}
      >
        {markerPosition && (
          <Marker coordinate={markerPosition} title="Selected Location" />
        )}
      </MapView>

      {/* Confirm Location Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleConfirmLocation}
          style={styles.confirmButton}
        >
          <Text style={styles.buttonText}>Confirm Location</Text>
        </TouchableOpacity>
        {noProvider && (
          <TouchableOpacity
            onPress={() => router.push("(tabs)/(user)/home/dashboard")} // Add your home navigation function
            style={styles.confirmButton}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center on Current Location Button */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          onPress={centerMapOnCurrentLocation}
          style={styles.centerButton}
        >
          <Ionicons name="locate-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 70,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    flexDirection: "row", // Align buttons horizontally
    justifyContent: "space-between", // Space between buttons
  },
  confirmButton: {
    flex: 1, // Make buttons take equal width
    marginHorizontal: 5, // Add horizontal margin between buttons
    padding: 15,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#9b5377",
    elevation: 5,
  },
  centerButtonContainer: {
    position: "absolute",
    bottom: 120,
    right: 10,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 50,
    elevation: 5,
  },
  centerButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default MapScreen;
