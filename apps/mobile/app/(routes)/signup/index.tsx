import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@/utils/toast";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

const signupUser = async (userData: SignupFormData) => {
  try {
    const response = await axiosInstance.post(
      "/auth/api/user-registration",
      userData
    );
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      if (!error.response) {
        throw new Error("Network error. Please check your connection!");
      }

      // handle different status codes
      const status = error?.response?.status;
      const errorData = error?.response?.data;

      if (status === 400 || status === 422) {
        throw new Error(errorData?.message || "Invalid input data");
      } else if (status === 409) {
        throw new Error(
          errorData?.message || "User already exist with this email"
        );
      } else if (status >= 500) {
        throw new Error(
          errorData?.message || "Server error. Please try again later!"
        );
      } else {
        throw new Error(errorData?.message || "Signup failed");
      }
    }

    throw new Error("An unexpected error occurred");
  }
};

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);

  // Signup form
  const signupForm = useForm<SignupFormData>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data, variables) => {
      router.replace({
        pathname: "/(routes)/signup-otp",
        params: {
          name: variables.name,
          email: variables?.email,
          password: variables.password,
        },
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message);
    },
  });

  const onSignupSubmit = (data: SignupFormData) => {
    // Trigger the mutation
    signupMutation.mutate(data);
  };

  const handleSignInNavigation = () => {
    router.push("/(routes)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-12 mb-8">
            <Text className="text-3xl font-poppins-bold text-foreground mb-2">
              Create Account
            </Text>
            <Text className="text-muted-foreground font-poppins text-base">
              Start exploring by creating your account
            </Text>
          </View>

          {/* Form fields */}
          <View className="gap-6">
            {/* Name Field */}
            <View>
              <Controller
                control={signupForm.control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-white rounded-xl px-4 py-4 border-2 ${
                      signupForm.formState.errors.name
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  >
                    <Ionicons name="person-outline" size={20} color="#94A3B8" />
                    <TextInput
                      className="flex-1 ml-3 text-foreground font-poppins"
                      placeholder="Create your name"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={!signupMutation.isPending}
                    />
                  </View>
                )}
              />
              {signupForm.formState.errors.name && (
                <Text className="text-destructive text-sm font-poppins mt-2">
                  {signupForm.formState.errors.name.message}
                </Text>
              )}
            </View>

            {/* Email Field */}
            <View>
              <Controller
                control={signupForm.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-white rounded-xl px-4 py-4 border-2 ${
                      signupForm.formState.errors.email
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={"#94A3B8"}
                    />
                    <TextInput
                      className="flex-1 ml-3 text-foreground font-poppins"
                      placeholder="Phone number or email"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!signupMutation.isPending}
                    />
                  </View>
                )}
              />
              {signupForm.formState.errors.email && (
                <Text className="text-destructive text-sm font-poppins mt-2">
                  {signupForm.formState.errors.email.message}
                </Text>
              )}
            </View>

            {/* Password Field */}
            <View>
              <Controller
                control={signupForm.control}
                name="password"
                rules={{
                  required: "Password is required",
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-white rounded-xl px-4 py-4 border-2 ${
                      signupForm.formState.errors.password
                        ? "border-destructive"
                        : "border-input"
                    }`}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#94A3B8"
                    />
                    <TextInput
                      className="flex-1 ml-3 text-foreground font-poppins"
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      editable={!signupMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={signupMutation.isPending}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {signupForm.formState.errors.password && (
                <Text className="text-destructive text-sm font-poppins mt-2">
                  {signupForm.formState.errors.password.message}
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 mt-8 ${
              signupForm.formState.isValid ? "bg-primary" : "bg-muted"
            }`}
            onPress={signupForm.handleSubmit(onSignupSubmit)}
            disabled={!signupForm.formState.isValid || signupMutation.isPending}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-poppins-semibold">
              {signupMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-muted-foreground font-poppins">
              Or using other method
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Login Buttons */}
          <View className="space-y-4 mb-8">
            {/* Google Sign In */}
            <TouchableOpacity
              className="flex-row items-center mb-4 justify-center bg-white border border-border rounded-xl py-4"
              disabled={signupMutation.isPending}
            >
              <View className="w-6 h-6 mr-3">
                <Image
                  source={{
                    uri: "https://developers.google.com/identity/images/g-logo.png",
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-foreground text-base font-poppins-medium">
                Sign Up with Google
              </Text>
            </TouchableOpacity>

            {/* Facebook Sign In */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-border rounded-xl py-4"
              disabled={signupMutation.isPending}
            >
              <Ionicons
                name="logo-facebook"
                size={24}
                color="#1877F2"
                className="mr-3"
              />
              <Text className="text-foreground text-base font-poppins-medium ml-3">
                Sign Up with Facebook
              </Text>
            </TouchableOpacity>
          </View>

          {/* Switch to Sign In Link */}
          <View className="flex-row justify-center mb-8">
            <Text className="text-muted-foreground font-poppins">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={handleSignInNavigation}
              disabled={signupMutation.isPending}
            >
              <Text className="text-primary font-poppins-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
