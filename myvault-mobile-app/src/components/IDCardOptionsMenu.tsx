import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';

// Define the structure of id card

interface IDCardData {
  id: string;
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  issuedDate: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

 // Props fro the options menu component

interface IDCardOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  cardData: IDCardData | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IDCardOptionsMenu: React.FC<IDCardOptionsMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  cardData
}) => {

  // Close the menu when the background is tapped
  const handleBackdropPress = () => {
    onClose();
  };

  // Reusable component for each menu option
  const MenuOption = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color = '#333',
    disabled = false 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.menuOption, disabled && styles.disabledOption]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color }, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.menuArrow, disabled && styles.disabledText]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <View style={styles.menuContainer}>
          
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <View style={styles.headerContent}>
             
            </View>
            
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeIconButton}
              onPress={onClose}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContent}>
            
            {/* Edit Option */}
            <MenuOption
              icon=""
              title="Edit ID Card"
              subtitle="Update your ID information"
              onPress={onEdit}
              color="#007AFF"
            />

            {/* Separator line */}
            <View style={styles.menuSeparator} />

            {/* Delete Option */}
            <MenuOption
              icon=""
              title="Delete ID Card"
              subtitle="Permanently remove from device"
              onPress={onDelete}
              color="#ff3b30"
            />
          </View>

          {/* Menu Footer */}
          <View style={styles.menuFooter}>
            <Text style={styles.securityNote}>
              🔒 All actions are performed securely on your device
            </Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: screenWidth - 40,
    maxWidth: 350,
    maxHeight: screenHeight * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flex: 1,
  },
  menuHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  menuHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#666',
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  disabledOption: {
    opacity: 0.5,
  },

  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  disabledText: {
    color: '#ccc',
  },
  menuArrow: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: '300',
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  menuFooter: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  securityNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default IDCardOptionsMenu;