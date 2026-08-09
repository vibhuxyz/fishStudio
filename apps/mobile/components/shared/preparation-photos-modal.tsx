import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  photos: { url: string; publicId: string }[];
}

/**
 * The cutting-staff's photos of the fish after it was cut and weighed. Shown
 * full-width rather than as a thumbnail grid — the whole point is that the
 * customer can check the weight reading on the scale.
 */
export default function PreparationPhotosModal({ visible, onClose, photos }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          maxHeight: SCREEN_HEIGHT * 0.85,
        }}
      >
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ width: 44, height: 5, borderRadius: 99, backgroundColor: "#D1D5DB" }} />
        </View>

        <View className="flex-row items-center justify-between px-5 py-3 border-b border-border">
          <View>
            <Text className="text-base font-poppins-semibold text-foreground">
              Cutting & Weight Photos
            </Text>
            <Text className="text-xs font-poppins text-muted-foreground mt-0.5">
              Taken at the shop while your order was prepared
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {photos.map((photo, idx) => (
            <Image
              key={photo.publicId ?? idx}
              source={{ uri: photo.url }}
              style={{
                width: "100%",
                height: SCREEN_WIDTH * 0.9,
                borderRadius: 16,
                backgroundColor: colors.secondaryBg,
              }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
