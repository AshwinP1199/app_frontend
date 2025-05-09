// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import * as Location from "expo-location";
// import { Linking } from "react-native";
// import axios from "axios"; // For sending data to the backend

// const CurrentLocationScreen = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [isSharingLiveLocation, setIsSharingLiveLocation] = useState(false);
//   const [liveLocationLink, setLiveLocationLink] = useState(null);

//   useEffect(() => {
//     const startLiveLocation = async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access location was denied");
//         return;
//       }

//       // Start watching the location updates
//       const locationSubscription = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.High,
//           timeInterval: 5000, // Update every 5 seconds
//           distanceInterval: 10, // Update every 10 meters
//         },
//         (location) => {
//           setCurrentLocation({
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//           });

//           // Update the location on your backend
//           sendLocationToBackend(
//             location.coords.latitude,
//             location.coords.longitude
//           );
//         }
//       );

//       return () => {
//         // Stop watching location when the user stops sharing
//         locationSubscription.remove();
//       };
//     };

//     if (isSharingLiveLocation) {
//       startLiveLocation();
//     }
//   }, [isSharingLiveLocation]);

//   const sendLocationToBackend = async (latitude, longitude) => {
//     try {
//       // Replace with your backend API endpoint to store live location
//       await axios.post("https://your-backend.com/api/live-location", {
//         latitude,
//         longitude,
//       });

//       // Once the location is shared, set the link (this could be a link to a public map view showing the live location)
//       setLiveLocationLink("https://your-backend.com/view-live-location"); // Replace with actual link generation logic
//     } catch (error) {
//       console.error("Error sending location to backend:", error);
//     }
//   };

//   const handleShareLiveLocation = () => {
//     if (liveLocationLink) {
//       const whatsappUrl = `whatsapp://send?text=I'm sharing my live location, track me here: ${liveLocationLink}`;
//       Linking.openURL(whatsappUrl)
//         .then(() => console.log("WhatsApp opened"))
//         .catch((error) => console.error("Error opening WhatsApp:", error));
//     } else {
//       alert("No live location link available yet.");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Live Location Sharing</Text>
//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => setIsSharingLiveLocation(true)}
//       >
//         <Text style={styles.buttonText}>Start Live Location</Text>
//       </TouchableOpacity>

//       {isSharingLiveLocation && (
//         <Text style={styles.statusText}>Live location sharing started...</Text>
//       )}

//       {liveLocationLink && (
//         <TouchableOpacity
//           style={styles.button}
//           onPress={handleShareLiveLocation}
//         >
//           <Text style={styles.buttonText}>Share Live Location on WhatsApp</Text>
//         </TouchableOpacity>
//       )}

//       {!liveLocationLink && isSharingLiveLocation && (
//         <Text style={styles.statusText}>Generating live location link...</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f8f8f8",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   button: {
//     padding: 15,
//     backgroundColor: "#25D366", // WhatsApp green color
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   statusText: {
//     fontSize: 16,
//     color: "gray",
//     marginTop: 10,
//   },
// });

// export default CurrentLocationScreen;
