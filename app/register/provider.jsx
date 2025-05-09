import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import axios from "../../api/axios"; // Adjust the path as necessary
import uploadFileToFirebase from "../../utils/UploadFileToFirebase";
import { Link } from "expo-router";
import * as Notifications from "expo-notifications";
import CountryPicker from "react-native-country-picker-modal";

export default function RegisterProvider() {
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [documentName, setDocumentName] = useState();
  const [document, setDocument] = useState();
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [callingCode, setCallingCode] = useState("+1");
  const router = useRouter();

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

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;
      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error.message);
    }
  };

  // Pick a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
      });

      setDocument(result);
      setDocumentName(result.assets[0].name);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to pick document.");
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

  // Clear the selected document
  const clearDocument = () => {
    setDocumentName(null);
    setDocument(null);
    Alert.alert("Document cleared", "You have cleared the document selection.");
  };

  const handleRegister = async () => {
    setLoading(true);
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (
      !userName ||
      !fullName ||
      !email ||
      !mobileNo ||
      !password ||
      !address ||
      !profileImage
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      setLoading(false);
      return;
    }
    if (!emailPattern.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!document) {
      Alert.alert("Error", "Please upload a verification document.");
      setLoading(false);
      return;
    }
    const fcmToken = await getFcmToken();
    setLoading(true);
    try {
      //upload img
      let profileImageURL = null;

      profileImageURL = await uploadFileToFirebase(
        { uri: profileImage, name: "profile_image.jpg" },
        "image"
      );

      // Upload the document and get the download URL
      const documentURL = await uploadFileToFirebase(
        document.assets[0],
        "file"
      );
      const fullMobileNo = callingCode + mobileNo;
      const payload = {
        userName,
        fullName,
        email,
        password,
        mobileNo: fullMobileNo,
        address,
        document: documentURL,
        role: "Provider",
        profileImage: profileImageURL,
        fcmToken,
      };
      const response = await axios.post("user/register", payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Provider registered successfully!");
        setUserName("");
        setFullName("");
        setEmail("");
        setMobileNo("");
        setAddress("");
        setPassword("");
        setProfileImage(null);
        setDocument(null);
        setDocumentName(null);
        setCountryCode("US");
        setCallingCode("+1");
        router.push("../../login", { relativeToDirectory: true });
      } else {
        Alert.alert("Error", response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Register Provider</Text>

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
      <View style={styles.phoneContainer}>
        <CountryPicker
          countryCode={countryCode}
          withCallingCodeButton
          withFilter
          withFlag
          onSelect={(country) => {
            setCountryCode(country.cca2);
            setCallingCode(`+${country.callingCode[0]}`);
          }}
        />
        <TextInput
          style={styles.mobileInput}
          placeholder="Mobile Number *"
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
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#9b5377"
            style={{ paddingRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      {/* Upload Verification Documents */}
      <Text style={styles.uploadLabel}>Upload Verification Documents *</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        {documentName ? (
          <>
            <Text style={styles.uploadButtonText}>{documentName}</Text>
            <Ionicons
              style={styles.closeCircleButton}
              onPress={clearDocument}
              name="close-circle-outline"
              size={24}
              color="#a6a3a5"
            />
          </>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={24} color="#a6a3a5" />
            <Text style={styles.uploadButtonText}>Upload files</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Register Button */}
      <View style={styles.registerButtonContainer}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Link to Login */}
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Link href={"/login"}>
            <Text style={styles.link}>Login</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#9b5377",
    borderRadius: 20,
    padding: 5,
  },
  clearIcon: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  input: {
    height: 50,
    borderColor: "#9b5377",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#9b5377",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  input2: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
  },
  uploadLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
  },
  registerButtonContainer: {
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: "#9b5377",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 16,
  },
  link: {
    color: "#9b5377",
    fontWeight: "bold",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#9b5377",
    color: "#9b5377",
    marginLeft: 10, // Spacing between country code picker and mobile input
  },
});
