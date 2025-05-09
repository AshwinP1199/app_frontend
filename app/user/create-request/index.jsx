import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import CheckBox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import axios from "../../../api/axios";

export default function Home() {
  const [safetyPreference, setSafetyPreference] = useState("");
  const [communicationPreferences, setCommunicationPreferences] = useState({
    talk: false,
    dontTalk: false,
    maintainDistance: false,
  });
  const [keepDistance, setKeepDistance] = useState(0);
  const [identityReveal, setIdentityReveal] = useState(false);
  const [physicalContact, setPhysicalContact] = useState(false);
  const [providerType, setProviderType] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [user, setUser] = useState();

  const router = useRouter();

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        setUser(res.data.data);
      } catch (error) {
        console.log("error", error);
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Something went wrong with user. Please try again later."
        );
      }
    };
    getUser();
    getCurrentLocation();
  }, []);

  const handleRequest = async () => {
    if (
      (!communicationPreferences.talk &&
        !communicationPreferences.dontTalk &&
        !communicationPreferences.maintainDistance) || // Ensure at least one communication preference is selected
      !safetyPreference ||
      !providerType ||
      !currentLocation ||
      !currentLocation.latitude ||
      !currentLocation.longitude
    ) {
      alert("Please fill in all the required fields.");
      return;
    }
    const pickupName = await Location.reverseGeocodeAsync(currentLocation);
    const addressString = `${pickupName[0].street}, ${pickupName[0].city}, ${pickupName[0].region}, ${pickupName[0].country}`;
    const requestData = {
      userId: user?._id,
      providerId: null,
      preferences: [
        {
          type: providerType,
          communication: communicationPreferences.talk,
          physical: physicalContact ? true : false,
          identity: identityReveal ? true : false,
          keepDistance: keepDistance,
          safety:
            safetyPreference.charAt(0).toUpperCase() +
            safetyPreference.slice(1),
        },
      ],
      pickupLocation: {
        name: addressString,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      dropoffLocation: {
        name: "no name",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    };

    setLoading(true);

    try {
      await AsyncStorage.setItem("tripRequest", JSON.stringify(requestData));
      router.push("user/create-request/MapSelect");
    } catch (error) {
      console.error("Error saving trip request:", error);
      alert("Failed to save trip request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? ( // Show loading indicator if loading is true
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9b5377" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Create Request</Text>

            <Text style={styles.label}>Safety Preferences</Text>
            <Picker
              selectedValue={safetyPreference}
              style={styles.picker}
              onValueChange={(itemValue) => setSafetyPreference(itemValue)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
            </Picker>

            <Text style={styles.label}>Keep Distance (in meters)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter distance"
              value={keepDistance.toString()}
              onChangeText={(value) =>
                setKeepDistance(parseInt(value, 10) || 0)
              }
            />

            <Text style={styles.label}>Select Provider Type</Text>
            <Picker
              selectedValue={providerType}
              style={styles.picker}
              onValueChange={(itemValue) => setProviderType(itemValue)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="LGBTQ" value="lgbtq" />
              <Picker.Item label="Any" value="any" />
            </Picker>

            {/* Physical Contact */}
            <View style={styles.inlineSection}>
              <Text style={styles.inlineLabel}>Physical Contact</Text>
              <View style={styles.inlineCheckboxContainer}>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={physicalContact}
                    onValueChange={setPhysicalContact}
                  />
                  <Text style={styles.checkboxLabel}>Yes</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={!physicalContact} // Negation of Yes
                    onValueChange={() => setPhysicalContact(false)} // Uncheck Yes when No is checked
                  />
                  <Text style={styles.checkboxLabel}>No</Text>
                </View>
              </View>
            </View>

            {/* Identity Reveal */}
            <View style={styles.inlineSection}>
              <Text style={styles.inlineLabel}>Identity Reveal</Text>
              <View style={styles.inlineCheckboxContainer}>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={identityReveal}
                    onValueChange={setIdentityReveal}
                  />
                  <Text style={styles.checkboxLabel}>Yes</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={!identityReveal} // Negation of Yes
                    onValueChange={() => setIdentityReveal(false)} // Uncheck Yes when No is checked
                  />
                  <Text style={styles.checkboxLabel}>No</Text>
                </View>
              </View>
            </View>

            {/* Communication Preferences */}
            <View style={styles.inlineSection}>
              <Text style={styles.inlineLabel}>Communication Preferences</Text>
              <View style={styles.inlineCheckboxContainer}>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={communicationPreferences.talk}
                    onValueChange={(value) =>
                      setCommunicationPreferences((prev) => ({
                        ...prev,
                        talk: value,
                      }))
                    }
                  />
                  <Text style={styles.checkboxLabel}>Talk</Text>
                </View>
                <View style={styles.checkboxRow}>
                  <CheckBox
                    style={styles.checkbox}
                    value={communicationPreferences.dontTalk}
                    onValueChange={(value) =>
                      setCommunicationPreferences((prev) => ({
                        ...prev,
                        dontTalk: value,
                      }))
                    }
                  />
                  <Text style={styles.checkboxLabel}>Don't Talk</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRequest}
              >
                <Text style={styles.submitButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 30,
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#7E245D",
  },
  label: {
    fontSize: 16,
    color: "#a6a3a5",
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    borderRadius: 5,
    padding: 10,
  },
  picker: {
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#a6a3a5",
    backgroundColor: "#fff",
  },
  inlineSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inlineLabel: {
    flex: 1,
    fontSize: 16,
    color: "#a6a3a5",
    fontWeight: "bold",
    marginEnd: 10,
  },
  inlineCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  checkboxLabel: {
    color: "#a6a3a5",
    marginLeft: 8,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
