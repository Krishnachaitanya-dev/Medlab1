import React, { useState } from "react";
import { Tabs } from "expo-router";
import { Pressable, Modal, View, StyleSheet } from "react-native";
import colors from "@/constants/colors";
import { Home, Users, Microscope, FileText, Receipt, LogOut, Database, UserPlus } from "lucide-react-native";
import { useAuthStore } from "@/store/auth-store";
import DataManagement from "@/components/DataManagement";
import HospitalSettings from "@/components/HospitalSettings";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const { logout } = useAuthStore();
  const [dataManagementVisible, setDataManagementVisible] = useState(false);
  const [hospitalSettingsVisible, setHospitalSettingsVisible] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you might want to confirm before logging out
    logout();
  };

  const handleRegisterPatient = () => {
    router.push('/register-patient');
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          // Hide the "(tabs)" text from the header
          headerTitle: "",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable
                onPress={handleRegisterPatient}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  padding: 10,
                })}
              >
                <UserPlus size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setDataManagementVisible(true)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  padding: 10,
                })}
              >
                <Database size={22} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  padding: 10,
                  marginRight: 10,
                })}
              >
                <LogOut size={22} color={colors.text} />
              </Pressable>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            headerTitle: "Dashboard",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="patients"
          options={{
            title: "Patients",
            headerTitle: "Patients",
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tests"
          options={{
            title: "Tests",
            headerTitle: "Tests",
            tabBarIcon: ({ color }) => <Microscope size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Reports",
            headerTitle: "Reports",
            tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            title: "Invoices",
            headerTitle: "Invoices",
            tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
          }}
        />
      </Tabs>

      {/* Data Management Modal */}
      <Modal
        visible={dataManagementVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDataManagementVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <DataManagement 
            onClose={() => setDataManagementVisible(false)} 
            onOpenHospitalSettings={() => {
              setDataManagementVisible(false);
              setHospitalSettingsVisible(true);
            }}
          />
        </View>
      </Modal>

      {/* Hospital Settings Modal */}
      <Modal
        visible={hospitalSettingsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHospitalSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <HospitalSettings onClose={() => setHospitalSettingsVisible(false)} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});