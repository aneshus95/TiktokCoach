/**
 * NicheSelectionScreen - Content Flow Edition
 * Dark tech aesthetic with cyan glow accents
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput as RNTextInput,
  Platform,
} from 'react-native';
import { Title, Paragraph } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { ApiService, StorageService } from '../services/ApiService';

const POPULAR_NICHES = [
  { name: 'GRWM', emoji: '💄', color: '#00D4FF' },
  { name: 'Cooking', emoji: '👨‍🍳', color: '#00FFB3' },
  { name: 'Fitness', emoji: '💪', color: '#38BDF8' },
  { name: 'Comedy', emoji: '😂', color: '#00D4FF' },
  { name: 'Beauty', emoji: '✨', color: '#00FFB3' },
  { name: 'Dance', emoji: '💃', color: '#38BDF8' },
  { name: 'DITL', emoji: '📱', color: '#00D4FF' },
  { name: 'Tutorial', emoji: '📚', color: '#00FFB3' },
  { name: 'Gaming', emoji: '🎮', color: '#38BDF8' },
  { name: 'Fashion', emoji: '👗', color: '#00D4FF' },
];

const FLOW_STEPS = [
  { emoji: '📹', label: 'upload your video' },
  { emoji: '🧠', label: 'AI deep analysis' },
  { emoji: '📊', label: 'viral benchmarking' },
  { emoji: '🚀', label: 'personalized strategy' },
];

export default function NicheSelectionScreen({ navigation }: any) {
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!niche.trim()) {
      Alert.alert('Select Niche', 'Choose your content niche to continue.');
      return;
    }
    setLoading(true);
    try {
      const result = await ApiService.selectNiche(niche);
      await StorageService.saveNiche(niche);
      if (result.job_id) await StorageService.saveJobId(result.job_id);
      navigation.navigate('VideoUpload', { jobId: result.job_id, niche });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#050810', '#0C1220']} style={styles.container}>
      {/* Circuit grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          {/* Glow orb */}
          <View style={styles.glowOrb} />
          <View style={styles.logoRow}>
            <View style={styles.logoBracket}>
              <Title style={styles.logoText}>{'»'}</Title>
            </View>
            <Title style={styles.appName}>CONTENT FLOW</Title>
          </View>
          <Title style={styles.title}>Select Your Niche</Title>
          <Paragraph style={styles.subtitle}>
            Define your content space to get started
          </Paragraph>
        </View>

        {/* Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputLabel}>
            <View style={styles.dot} />
            <Paragraph style={styles.inputLabelText}>CONTENT NICHE</Paragraph>
          </View>
          <View style={styles.inputContainer}>
            <RNTextInput
              value={niche}
              onChangeText={setNiche}
              placeholder="e.g. skincare, travel vlog, finance tips..."
              placeholderTextColor="#334155"
              style={styles.input}
            />
            {niche.length > 0 && <View style={styles.inputGlow} />}
          </View>
        </View>

        {/* Niche Grid */}
        <View style={styles.sectionHeader}>
          <View style={styles.dot} />
          <Paragraph style={styles.sectionLabel}>POPULAR NICHES</Paragraph>
        </View>

        <View style={styles.nicheGrid}>
          {POPULAR_NICHES.map((item) => {
            const selected = niche === item.name;
            return (
              <TouchableOpacity
                key={item.name}
                onPress={() => setNiche(item.name)}
                activeOpacity={0.7}
                style={[styles.nicheChip, selected && styles.nicheChipSelected]}
              >
                {selected && (
                  <View style={[styles.chipGlow, { shadowColor: item.color }]} />
                )}
                <Paragraph style={styles.nicheEmoji}>{item.emoji}</Paragraph>
                <Paragraph style={[styles.nicheText, selected && { color: '#00D4FF' }]}>
                  {item.name}
                </Paragraph>
                {selected && <View style={styles.chipDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Flow Preview */}
        <View style={styles.flowCard}>
          <View style={styles.flowHeader}>
            <View style={styles.dot} />
            <Paragraph style={styles.sectionLabel}>YOUR CONTENT FLOW</Paragraph>
          </View>
          {FLOW_STEPS.map((step, i) => (
            <View key={i} style={styles.flowStep}>
              <View style={styles.flowLine}>
                <View style={[styles.flowDot, i === 0 && styles.flowDotActive]} />
                {i < FLOW_STEPS.length - 1 && <View style={styles.flowConnector} />}
              </View>
              <View style={styles.flowContent}>
                <Paragraph style={styles.flowEmoji}>{step.emoji}</Paragraph>
                <Paragraph style={styles.flowLabel}>{step.label}</Paragraph>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!niche.trim() || loading}
          activeOpacity={0.85}
        >
          <View style={[styles.ctaButton, (!niche.trim() || loading) && styles.ctaDisabled]}>
            <LinearGradient
              colors={(!niche.trim() || loading) ? ['#1E293B', '#1E293B'] : ['#00D4FF', '#00FFB3']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Paragraph style={[styles.ctaText, (!niche.trim() || loading) && styles.ctaTextDisabled]}>
                {loading ? 'INITIALIZING...' : 'START FLOW  →'}
              </Paragraph>
            </LinearGradient>
            {niche.trim() && !loading && <View style={styles.ctaGlow} />}
          </View>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  content: { padding: 24, paddingBottom: 48, paddingTop: Platform.OS === 'ios' ? 60 : 40 },

  // Header
  header: { alignItems: 'center', marginBottom: 40, position: 'relative' },
  glowOrb: {
    position: 'absolute',
    top: -20, width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: '#00D4FF',
    opacity: 0.04,
    alignSelf: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBracket: {
    width: 32, height: 32,
    backgroundColor: '#00D4FF',
    borderRadius: 4,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  logoText: { fontSize: 18, color: '#050810', fontWeight: '900' },
  appName: { fontSize: 18, fontWeight: '900', color: '#E2F0FF', letterSpacing: 4 },
  title: {
    fontSize: 28, fontWeight: '900', color: '#E2F0FF',
    letterSpacing: 1, marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: '#64748B', letterSpacing: 0.5 },

  // Input
  inputWrapper: { marginBottom: 28 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  inputLabelText: { fontSize: 11, color: '#00D4FF', letterSpacing: 2, fontWeight: '700' },
  inputContainer: { position: 'relative' },
  input: {
    backgroundColor: '#0C1220',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 12,
    padding: 16, paddingHorizontal: 20,
    fontSize: 16, color: '#E2F0FF',
    fontWeight: '500',
  },
  inputGlow: {
    position: 'absolute',
    bottom: -1, left: 20, right: 20, height: 2,
    backgroundColor: '#00D4FF',
    borderRadius: 1,
    opacity: 0.8,
  },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 11, color: '#64748B', letterSpacing: 2, fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D4FF', marginRight: 10 },

  // Niche Grid
  nicheGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  nicheChip: {
    width: '30%',
    backgroundColor: '#0C1220',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 12, padding: 14,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  nicheChipSelected: {
    borderColor: '#00D4FF',
    backgroundColor: '#00D4FF10',
  },
  chipGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  nicheEmoji: { fontSize: 26, marginBottom: 6 },
  nicheText: { fontSize: 12, color: '#64748B', fontWeight: '600', letterSpacing: 0.3 },
  chipDot: {
    position: 'absolute', top: 8, right: 8,
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D4FF',
  },

  // Flow card
  flowCard: {
    backgroundColor: '#0C1220',
    borderWidth: 1, borderColor: '#1E293B',
    borderRadius: 16, padding: 20, marginBottom: 32,
  },
  flowHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  flowStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  flowLine: { alignItems: 'center', marginRight: 16, width: 20 },
  flowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  flowDotActive: { backgroundColor: '#00D4FF', borderColor: '#00D4FF', shadowColor: '#00D4FF', shadowOpacity: 0.8, shadowRadius: 8 },
  flowConnector: { width: 1, height: 28, backgroundColor: '#1E293B', marginVertical: 4 },
  flowContent: { flexDirection: 'row', alignItems: 'center', paddingBottom: 32 },
  flowEmoji: { fontSize: 18, marginRight: 12 },
  flowLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  // CTA
  ctaButton: { borderRadius: 14, overflow: 'hidden', position: 'relative' },
  ctaDisabled: { opacity: 0.4 },
  ctaGradient: { paddingVertical: 18, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '900', color: '#050810', letterSpacing: 3 },
  ctaTextDisabled: { color: '#334155' },
  ctaGlow: {
    position: 'absolute', bottom: -10, left: 40, right: 40, height: 20,
    backgroundColor: '#00D4FF', borderRadius: 10,
    opacity: 0.3,
    shadowColor: '#00D4FF', shadowOpacity: 1, shadowRadius: 20,
  },
});
