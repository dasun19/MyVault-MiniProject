import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; 


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

interface VirtualIDCardProps {
  cardData: IDCardData;
  onPress?: () => void;
  showQRCode?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 40; // 20px margin on each side
const cardHeight = cardWidth * 0.63; // Standard ID card ratio

const VirtualIDCard: React.FC<VirtualIDCardProps> = ({ 
  cardData, 
  onPress,
  showQRCode = false 
}) => {
  
  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Extract initials from name for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Mask part of ID number for privacy
  const getMaskedIdNumber = (idNumber?: string): string => {
    if (!idNumber) return '';
    if (idNumber.length <= 4) return idNumber;
    const visible = idNumber.slice(-4);
    const masked = '*'.repeat(Math.max(0, idNumber.length - 4));
    return masked + visible;
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* 
        If you have react-native-linear-gradient installed, use this:
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.card}
        >
        
        If not, use the View below with a solid background:
      */}
      <View style={styles.card}>
        
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.countryText}>DEMOCRATIC SOCIALIST REPUBLIC OF</Text>
            <Text style={styles.sriLankaText}>SRI LANKA</Text>
            <Text style={styles.cardTypeText}>NATIONAL IDENTITY CARD</Text>
          </View>
          
          {/* Profile Avatar 
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(cardData.fullName)}</Text>
          </View>
          */}
        </View>

        {/* Main Content Section */}
        <View style={styles.cardContent}>
          
          {/* Left Side - Personal Info */}
          <View style={styles.leftSection}>
            
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name:</Text>
              <Text style={styles.fieldValue} numberOfLines={2} ellipsizeMode="tail">
                {cardData.fullName}
              </Text>
            </View>

            {/* ID Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>NIC No:</Text>
              <Text style={styles.fieldValue}>
                {cardData.idNumber}
              </Text>
            </View>

            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Date of Birth:</Text>
              <Text style={styles.fieldValue}>
                {formatDisplayDate(cardData.dateOfBirth)}
              </Text>
            </View>

          </View>

          {/* Right Side - Additional Info */}
          <View style={styles.rightSection}>
            
            {/* Issued Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Issued:</Text>
              <Text style={styles.fieldValue}>
                {formatDisplayDate(cardData.issuedDate)}
              </Text>
            </View>

            {/* Digital Badge 
            <View style={styles.digitalBadge}>
              <Text style={styles.digitalBadgeText}>DIGITAL</Text>
            </View>*/}

            {/* QR Code placeholder - you can implement actual QR code later 
            {showQRCode && (
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodePlaceholder}>QR</Text>
                <Text style={styles.qrCodeText}>Scan me</Text>
              </View>
            )}
              */}

          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.cardFooter}>
          <Text style={styles.hashPreview}>
            Hash: {(cardData.hash || 'null').substring(0, 16)}...
          </Text>
         
          {/* Verification Badge */}
            {cardData.isVerified && (
              <View style={styles.verificationBadge}>
                <Text style={styles.verificationIcon}>✓ Verified</Text>
              </View>
            )}
            
        </View>

      </View>
      {/* 
        If using LinearGradient, close it here:
        </LinearGradient> 
      */}
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginVertical: 10,
    // Add shadow for the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#667eea', // Fallback color if LinearGradient is not used
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    // If you prefer a more government-official look, use this instead:
    // backgroundColor: '#1e3a8a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  countryText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  sriLankaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardTypeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cardContent: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 20,
  },
  leftSection: {
    flex: 1.5,
    paddingRight: 12,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14,
  },
  digitalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  digitalBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  qrCodeContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  qrCodePlaceholder: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  qrCodeText: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashPreview: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    fontFamily: 'monospace',
  },
  digitalStamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  verificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#34c759',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'white',
  },
  verificationIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default VirtualIDCard;