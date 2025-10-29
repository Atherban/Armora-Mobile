import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../../assets/styles/profile.styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import COLORS from "@/src/constants/colors";
import { useAuthStore } from "@/src/store/auth.store";
import { Image } from "expo-image";

const SPACING = 18;

/**
 * ProfileScreen displays the user's profile info, actions, and legal links.
 * Animations are used for a modern, engaging feel.
 * All interactive elements are accessible and have clear labels.
 * Shadows are applied to static wrappers to avoid animation glitches.
 * Layout is responsive using useWindowDimensions.
 */
const ProfileScreen = () => {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { logout } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser)); // convert from string to object
        }
      } catch (error) {
        console.log("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ backgroundColor: COLORS.black, flex: 1 }}>
        <ActivityIndicator size="large" color="#00bf8f" />
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const maxContentWidth = Math.min(width * 0.96, 420);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.black }}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          padding: SPACING,
          backgroundColor: COLORS.black, // Ensure parent is black
        }}
      >
        {/* App Title and Tagline (animated) */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.titleShadowWrapper, { backgroundColor: COLORS.black }]}
        >
          <View
            style={[
              styles.titleContainer,
              { maxWidth: maxContentWidth, backgroundColor: "#000" },
            ]}
          >
            <Text style={styles.labelMain}>Armora-X</Text>
            <Text style={styles.subText}>
              Next-gen security, powered by AI. Stay protected, stay ahead.
            </Text>
          </View>
        </Animated.View>

        {/* <ProfileHeader /> */}

        {/* Profile Info Section (animated) */}
        <Animated.View
          entering={FadeIn.duration(800)}
          style={[
            styles.profileSection,
            { maxWidth: maxContentWidth, backgroundColor: "#000" },
          ]}
        >
          <Text style={styles.statusText}>Welcome</Text>
          <View style={styles.profileCircle}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            </View>
          </View>
          <View style={styles.profileText}>
            {/* Username and email, replace with dynamic data as needed */}
            <Text
              style={{
                color: "white",
                fontSize: 22,
                marginTop: 6,
                fontWeight: "bold",
              }}
              accessibilityRole="text"
            >
              {user.username}
            </Text>
            <Text
              style={{ color: "gray", fontSize: 15, marginTop: 4 }}
              accessibilityRole="text"
            >
              {user.email}
            </Text>
          </View>
        </Animated.View>

        {/* Main Actions Section (animated) */}
        <Animated.View
          entering={FadeInDown.duration(700)}
          style={[
            styles.actionsShadowWrapper,
            { backgroundColor: COLORS.black },
          ]}
        >
          <View
            style={[
              styles.actionsSection,
              { maxWidth: maxContentWidth, backgroundColor: "#000" },
            ]}
          >
            {/* Contact Us: opens mail client */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Linking.openURL("mailto:support@yourdomain.com")}
              accessibilityRole="button"
              accessibilityLabel="Contact Us. Opens your email app."
            >
              <Ionicons name="mail" color="#00bf8f" size={22} />
              <Text style={styles.actionText}>Contact Us</Text>
            </TouchableOpacity>
            {/* Log Out: add logic as needed */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleLogout();
              }}
              accessibilityRole="button"
              accessibilityLabel="Log Out"
            >
              <Ionicons name="log-out" color="#00bf8f" size={22} />
              <Text style={styles.actionText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer: Legal Links (animated) */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(700)}
          style={[
            styles.footerSection,
            { maxWidth: maxContentWidth, backgroundColor: "#000" },
          ]}
        >
          {/* Privacy Policy: opens website */}
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() =>
              Linking.openURL("https://armoraxprivacy.netlify.app/")
            }
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy. Opens in browser."
          >
            <Ionicons name="document-text-sharp" color="#00bf8f" size={18} />
            <Text style={styles.footerText}>Privacy Policy</Text>
          </TouchableOpacity>
          {/* Terms of Service: opens website */}
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() =>
              Linking.openURL("https://termsandservice.netlify.app/")
            }
            accessibilityRole="link"
            accessibilityLabel="Terms of Service. Opens in browser."
          >
            <Ionicons name="shield-checkmark" color="#00bf8f" size={18} />
            <Text style={styles.footerText}>Terms of Service</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
