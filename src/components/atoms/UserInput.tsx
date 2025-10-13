import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  Platform,
  TextInputProps,
} from "react-native";
import React, { useRef, useState } from "react";

interface UserInputProps extends TextInputProps {
  label?: string;
  type?: "text" | "email" | "password" | "number";
}

const UserInput: React.FC<UserInputProps> = ({
  label = "Username",
  type = "text",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const animatedIsFocused = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value !== "" ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  // Map type prop to TextInput props
  let keyboardType: TextInputProps["keyboardType"] = "default";
  let secureTextEntry = false;
  let autoCapitalize: TextInputProps["autoCapitalize"] = "none";

  if (type === "email") {
    keyboardType = "email-address";
    autoCapitalize = "none";
  } else if (type === "password") {
    secureTextEntry = true;
    autoCapitalize = "none";
  } else if (type === "number") {
    keyboardType = "numeric";
  }

  const labelStyle = {
    position: "absolute" as const,
    left: 8,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [28, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#444", "#00bf8f"],
    }),
    backgroundColor: "#000",
    paddingHorizontal: 2,
    zIndex: 1,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? "#00bf8f" : "#00bf8f77",
            color: "#fff",
            backgroundColor: "black",
          },
        ]}
        value={value}
        onChangeText={setValue}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#444"
        {...props}
      />
    </View>
  );
};

export default UserInput;

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 12,
    paddingTop: Platform.OS === "android" ? 18 : 0,
  },
  input: {
    width: "100%",
    height: 44,
    borderColor: "#00bf8f77",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 16,
    backgroundColor: "#181818",
    color: "#fff",
  },
});
