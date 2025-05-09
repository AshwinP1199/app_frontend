import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install @expo/vector-icons
import axios from "../../api/axios";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import uploadFileToFirebase from "../../utils/UploadFileToFirebase";
import * as Location from "expo-location";
import { Link } from "expo-router"; // Import Link for navigation
import * as Notifications from "expo-notifications";
import CountryPicker from "react-native-country-picker-modal"; // Import CountryPicker

export default function RegisterUser() {
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("US"); // Default country code
  const [callingCode, setCallingCode] = useState("1"); // Default calling code (for US)
  const [process, setProcess] = useState(false);
  const router = useRouter();

  const fetchCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Location permission denied. Please enable it in settings.");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const getFcmToken = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      const projectId = "fe924ff0-2143-4b9f-81d0-e3ea06a914f5";
      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;

      return token;
    } catch (error) {
      alert("Error getting FCM token:", error.message);
    }
  };

  const handleRegister = async () => {
    setProcess(true);
    if (
      !userName ||
      !fullName ||
      !email ||
      !mobileNo ||
      !password ||
      !address
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      setProcess(false);
      return;
    }

    // Email validation regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      setProcess(false);
      return;
    }

    const location = await fetchCurrentLocation();
    if (!location) {
      setProcess(false);
      return;
    }

    const currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const fcmToken = await getFcmToken();
    setLoading(true);

    try {
      let profileImageURL = null;
      if (profileImage) {
        profileImageURL = await uploadFileToFirebase(
          { uri: profileImage, name: "profile_image.jpg" },
          "image"
        );
      }

      const payload = {
        userName,
        fullName,
        email,
        password,
        mobileNo: `+${callingCode}${mobileNo}`, // Send mobile number with country code
        address,
        role: "User",
        profileImage: profileImageURL,
        fcmToken,
        location: currentLocation,
      };

      const response = await axios.post("user/register", payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "User registered successfully!");
        router.push("../../login", { relativeToDirectory: true });
      } else {
        Alert.alert("Error", response.data.message || "Registration failed.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setProcess(false);
      setLoading(false);
    }
  };

  // Pick profile image
  const pickProfileImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to the media library."
      );
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      const selectedImage = pickerResult.assets[0];
      // Check the size of the image
      const fileSize = selectedImage.fileSize;
      if (fileSize > 1000000) {
        // Check if file size is greater than 1MB
        Alert.alert("Error", "Image size must be less than 1MB.");
        return;
      }
      setProfileImage(pickerResult.assets[0].uri);
    } else {
      Alert.alert("Error", "Image selection was canceled.");
    }
  };

  // Clear the selected profile image
  const clearProfileImage = () => {
    setProfileImage(null);
    Alert.alert("Profile image cleared", "You have cleared the profile image.");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Register User</Text>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        {profileImage ? (
          <>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity
              style={styles.clearIcon}
              onPress={clearProfileImage}
            >
              <Ionicons name="close-circle-outline" size={24} color="#a6a3a5" />
            </TouchableOpacity>
          </>
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#9b5377" />
        )}
        <TouchableOpacity style={styles.cameraIcon} onPress={pickProfileImage}>
          <Ionicons name="camera-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="User Name *"
        placeholderTextColor="#a6a3a5"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        placeholderTextColor="#a6a3a5"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address *"
        placeholderTextColor="#a6a3a5"
        value={email}
        onChangeText={setEmail}
      />

      {/* Country Code and Phone Number */}
      <View style={styles.phoneContainer}>
        <CountryPicker
          withCallingCode
          withFlag
          withFilter
          countryCode={countryCode}
          onSelect={(country) => {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
          }}
        />
        <Text style={styles.callingCode}>+{callingCode}</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="Phone Number *"
          placeholderTextColor="#a6a3a5"
          value={mobileNo}
          onChangeText={(text) => {
            const cleanedText = text.replace(/[^0-9]/g, "");
            if (cleanedText.length < 10) {
              setMobileNo(cleanedText);
            }
          }}
          keyboardType="phone-pad"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Address *"
        placeholderTextColor="#a6a3a5"
        value={address}
        onChangeText={setAddress}
      />

      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input2}
          secureTextEntry={passwordVisible}
          placeholder="Password *"
          placeholderTextColor="#a6a3a5"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={{ padding: 10 }} // Increased touch area
        >
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#9b5377"
          />
        </TouchableOpacity>
      </View>

      {/* Register Button */}
      <View style={styles.registerButtonContainer}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading || process ? "Processing..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Link to Login */}
      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Link href="../login" style={styles.loginLink}>
          Login
        </Link>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    top: 50,
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#a6a3a5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#000",
  },
  input2: {
    flex: 1,
    color: "#000",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a6a3a5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a6a3a5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  callingCode: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  phoneInput: {
    flex: 1,
    marginLeft: 10,
    color: "#000",
  },
  profileImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#a6a3a5",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#9b5377",
    borderRadius: 50,
    padding: 5,
  },
  clearIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  registerButtonContainer: {
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: "#9b5377",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#a6a3a5",
  },
  loginLink: {
    color: "#9b5377",
    fontWeight: "bold",
  },
});
