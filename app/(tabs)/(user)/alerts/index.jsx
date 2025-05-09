import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import axios from "../../../../api/axios";

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showContacts, setShowContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [showAddContactsButton, setShowAddContactsButton] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        // Filter contacts with phone numbers only
        const filteredContacts = data.filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );
        setContacts(filteredContacts);
      } else {
        Alert.alert("Permission to access contacts was denied");
      }
    };

    if (showContacts) {
      fetchContacts();
    }

    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        const userData = res.data.data;

        setUser(userData);

        // If user has emergency contacts, set them to selectedContacts
        if (userData.emergency && userData.emergency.length > 0) {
          const formattedEmergencyContacts = userData.emergency.map(
            (contact) => ({
              name: contact.name,
              phoneNumbers: [{ number: contact.phoneNumber }],
            })
          );
          setSelectedContacts(formattedEmergencyContacts);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Something went wrong. Please try again later."
        );
      }
    };

    getUser();
  }, [showContacts]);

  const toggleSelectContact = (contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts(selectedContacts.filter((c) => c !== contact));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const addEmergencyContacts = () => {
    setShowContacts(true);
    setShowAddContactsButton(false);
  };

  const showNotificationAlert = (service) => {
    Alert.alert(
      "Emergency Service Notified",
      `Notified ${service} department!`,
      [{ text: "OK", onPress: () => console.log(`${service} notified`) }]
    );
  };

  const callContact = (number) => {
    let phoneNumber = `tel:${number}`;
    Linking.openURL(phoneNumber).catch((err) =>
      console.error("Failed to make a call", err)
    );
  };

  const saveSelectedContacts = async () => {
    try {
      const response = await axios.put(`user/${user?._id}`, {
        emergency: selectedContacts.map((contact) => ({
          name: contact.name,
          phoneNumber: contact.phoneNumbers?.[0]?.number || "No number",
        })),
      });

      // Check for successful response
      if (response.status >= 200 && response.status < 300) {
        Alert.alert("Success", "Contacts saved successfully!");
        setSelectedContacts([]); // Clear selected contacts after saving
        setShowContacts(false); // Hide contacts after saving
        setShowAddContactsButton(false); // Hide add contacts button after saving
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to save contacts"
        );
      }
    } catch (error) {
      console.error("Error saving contacts", error);
      Alert.alert("Error", "There was a problem saving the contacts.");
    }
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Emergency Button */}
      <TouchableOpacity style={styles.alertButton}>
        <MaterialIcons name="notifications-active" size={40} color="white" />
      </TouchableOpacity>

      <Text style={styles.infoText}>
        Tap the button below in case of an emergency, we will be notifying our
        support staff and your emergency contacts right away!
      </Text>

      {/* Emergency Services */}
      <View style={styles.servicesContainer}>
        <ServiceItem
          label="Police"
          number="131 444"
          icon="local-police"
          onPress={() => showNotificationAlert("Police")}
        />
        <ServiceItem
          label="Ambulance"
          number="1300 366 141"
          icon="local-hospital"
          onPress={() => showNotificationAlert("Ambulance")}
        />
        <ServiceItem
          label="Fire"
          number="1800 226 226"
          icon="local-fire-department"
          onPress={() => showNotificationAlert("Fire")}
        />
        <ServiceItem
          label="Emergency"
          number="000"
          icon="headset-mic"
          onPress={() => showNotificationAlert("Help Center")}
        />
      </View>

      {/* Selected Emergency Contacts */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Selected Emergency Contacts:</Text>
        {selectedContacts.map((contact, index) => (
          <ContactItem
            key={index}
            name={contact.name}
            number={contact.phoneNumbers[0].number}
            onPress={() => callContact(contact.phoneNumbers[0].number)}
          />
        ))}
      </View>

      {/* Add Emergency Contacts or Show Contacts Button */}
      {showAddContactsButton ? (
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => {
            saveSelectedContacts(); // Call the function to save contacts
          }}
        >
          <Text style={styles.addContactText}>Save Emergency Contacts</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => {
            addEmergencyContacts();
            setShowAddContactsButton(true); // Show the button to save selected contacts
          }}
        >
          <Text style={styles.addContactText}>Show Contacts</Text>
        </TouchableOpacity>
      )}

      {/* Show Contacts to Select From */}
      {showContacts && (
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Select Contacts:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {filteredContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => toggleSelectContact(contact)}
            >
              <View style={styles.contactDetails}>
                <MaterialIcons name="person" size={24} color="black" />
                <Text style={styles.contactText}>{contact.name}</Text>
              </View>
              <Text style={styles.contactNumber}>
                {contact.phoneNumbers[0].number}
              </Text>
              <MaterialIcons
                name={
                  selectedContacts.includes(contact)
                    ? "check-box"
                    : "check-box-outline-blank"
                }
                size={24}
                color={selectedContacts.includes(contact) ? "green" : "gray"}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Contact Item Component
const ContactItem = ({ name, number, onPress }) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress}>
    <View style={styles.contactDetails}>
      <MaterialIcons name="person" size={24} color="black" />
      <Text style={styles.contactText}>{name}</Text>
    </View>
    <Text style={styles.contactNumber}>{number}</Text>
  </TouchableOpacity>
);

// Emergency Service Item Component
const ServiceItem = ({ label, number, icon, onPress }) => (
  <TouchableOpacity style={styles.serviceItem} onPress={onPress}>
    <MaterialIcons name={icon} size={30} color="red" />
    <View>
      <Text style={styles.serviceLabel}>{label}</Text>
      <Text style={styles.serviceNumber}>{number}</Text>
    </View>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    alignItems: "center",
  },
  alertButton: {
    backgroundColor: "#e74c3c",
    padding: 20,
    borderRadius: 50,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    textAlign: "center",
    color: "#333",
    marginVertical: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "left",
    width: "100%",
  },
  contactSection: {
    width: "100%",
    marginVertical: 20,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  contactDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
  },
  contactNumber: {
    fontSize: 16,
    color: "#555",
  },
  addContactButton: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addContactText: {
    color: "white",
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  serviceItem: {
    width: "45%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  serviceNumber: {
    marginLeft: 10,
    fontSize: 14,
    color: "#777",
  },
});
