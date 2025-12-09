// src/components/VirtualALCertificate.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 40;

interface SubjectResult {
  subjectCode: string;
  result: string;
}

interface ALResultData {
  id: string;
  fullName: string;
  year: string;
  indexNumber: string;
  stream: string;
  zScore: string;
  subjects: SubjectResult[];
  generalTest: string;
  generalEnglish: string;
  districtRank: string;
  islandRank: string;
  hash: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

interface VirtualALCertificateProps {
  resultData: ALResultData;
  onPress?: () => void;
}

const VirtualALCertificate: React.FC<VirtualALCertificateProps> = ({
  resultData,
  onPress,
}) => {
  const formatRank = (rank: string) => (rank && rank !== '-' && rank !== '0' ? rank : '-');

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.govText}>DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</Text>
          <Text style={styles.deptText}>DEPARTMENT OF EXAMINATIONS</Text>
          <Text style={styles.title}>G.C.E. (ADVANCED LEVEL)</Text>
          <Text style={styles.examType}>EXAMINATION RESULTS</Text>
          <Text style={styles.year}>{resultData.year}</Text>
        </View>

        {/* Candidate Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Candidate Name</Text>
            <Text style={styles.infoValue}>{resultData.fullName}</Text>
          </View>

          <View style={styles.twoColumnContainer}>
            <View style={[styles.infoBox, styles.halfWidth]}>
              <Text style={styles.infoLabel}>Index Number</Text>
              <Text style={styles.infoValue}>{resultData.indexNumber}</Text>
            </View>
            <View style={[styles.infoBox, styles.halfWidth]}>
              <Text style={styles.infoLabel}>Stream</Text>
              <Text style={styles.infoValue}>{resultData.stream || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Subjects and Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Subject Results</Text>
          <View style={styles.resultsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerText]}>Subject Code</Text>
              <Text style={[styles.tableCell, styles.headerText]}>Grade</Text>
            </View>

            {resultData.subjects.map((sub, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{sub.subjectCode}</Text>
                <Text style={[styles.tableCell, styles.gradeCell]}>{sub.result}</Text>
              </View>
            ))}

            {resultData.subjects.length === 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>—</Text>
                <Text style={styles.tableCell}>—</Text>
              </View>
            )}
          </View>
        </View>

        {/* Test Scores */}
        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>Scores & Rankings</Text>
          
          <View style={styles.scoreGrid}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Z-Score</Text>
              <Text style={styles.scoreValue}>{resultData.zScore || '-'}</Text>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>General Test</Text>
              <Text style={styles.scoreValue}>{resultData.generalTest || '-'}</Text>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>General English</Text>
              <Text style={styles.scoreValue}>{resultData.generalEnglish || '-'}</Text>
            </View>
          </View>

          <View style={styles.rankingSection}>
            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>District Rank</Text>
              <Text style={styles.rankValue}>{formatRank(resultData.districtRank)}</Text>
            </View>
            <View style={styles.rankBox}>
              <Text style={styles.rankLabel}>Island Rank</Text>
              <Text style={styles.rankValue}>{formatRank(resultData.islandRank)}</Text>
            </View>
          </View>
        </View>

        {/* Verification Badge & Hash */}
        <View style={styles.verificationSection}>
          {resultData.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ VERIFIED</Text>
            </View>
          )}
          <View style={styles.hashContainer}>
            <Text style={styles.hashLabel}>Security Hash</Text>
            <Text style={styles.hashValue}>
              {(resultData.hash || '').substring(0, 32)}...
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Certified by Department of Examinations, Sri Lanka
          </Text>
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  govText: {
    fontSize: 12,
    color: '#555',
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 4,
  },
  deptText: {
    fontSize: 11,
    color: '#777',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  examType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  year: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563eb',
  },

  // Information Section
  infoSection: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  infoBox: {
    marginBottom: 16,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },

  // Results Section
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultsTable: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  headerText: {
    color: 'white',
    fontWeight: '600',
  },
  gradeCell: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2563eb',
  },

  // Scores Section
  scoresSection: {
    marginBottom: 24,
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e40af',
  },

  // Ranking Section
  rankingSection: {
    flexDirection: 'row',
    gap: 12,
  },
  rankBox: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    marginBottom: 6,
  },
  rankValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e40af',
  },

  // Verification Section
  verificationSection: {
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 12,
    alignItems: 'center',
  },
  verifiedText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hashContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  hashLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default VirtualALCertificate;