import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  useWindowDimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/signup.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../../store/auth.store";
import COLORS from "../../constants/colors";

// SignupScreen handles user registration UI and logic
// Animations are handled by react-native-reanimated for smooth transitions
// Shadows are applied to static wrappers to avoid animation glitches
// All layout is responsive using useWindowDimensions
const SignupScreen = () => {
  // --- Local state ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- Auth store and navigation ---
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    const result = await register(username, email, password);
    if (!result.success) {
      Alert.alert("Signup Failed", result.message || "Please try again.");
    }
  };

  // --- Responsive layout ---
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.92, 420);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "black" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Accent bar with subtle gradient */}
        <View style={styles.accentBarShadowWrapper}>
          <Animated.View
            entering={FadeIn.duration(900)}
            style={styles.accentBar}
          />
        </View>

        {/* Card container */}
        <View style={[styles.cardShadowWrapper, { width: cardWidth }]}>
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={styles.cardContainer}
          >
            <LinearGradient
              colors={["#00bf8f", "#000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.innerCard}>
                {/* Header */}
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Sign up to get started with Armora-X
                </Text>

                {/* --- FORM --- */}
                <View style={styles.formContainer}>
                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="johndoe"
                        placeholderTextColor={COLORS.placeholderText}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="johndoe@gmail.com"
                        value={email}
                        placeholderTextColor={COLORS.placeholderText}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="******"
                        placeholderTextColor={COLORS.placeholderText}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={20}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Register button with animation */}
                  <Animated.View
                    entering={FadeInUp.duration(800).delay(200)}
                    style={{
                      width: "100%",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.signupButton}
                      onPress={() => {
                        handleSignup();
                      }}
                    >
                      <Text style={styles.signupButtonText}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.divider} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.divider} />
                  </View>

                  {/* Login Redirect */}
                  <View style={styles.loginRow}>
                    <Text style={styles.loginText}>
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)")}>
                      <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
