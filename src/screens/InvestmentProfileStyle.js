import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  introduction: {
    padding: 20,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Slider Styles
  sliderContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sliderHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  currentProfileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  currentProfileText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  labelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 15,
    position: 'relative',
  },
  sliderTrackFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderKnob: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  scaleNumber: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  activeScaleNumber: {
    color: '#FFD700',
    fontWeight: 'bold',
  },

  // Bankroll Input Styles
  bankrollContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bankrollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  bankrollDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 20,
  },
  bankrollInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 8,
  },
  bankrollInput: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    paddingVertical: 15,
  },
  presetValues: {
    marginTop: 10,
  },
  presetTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    fontWeight: '600',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Profile Display Styles
  profileDisplay: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333333',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  profileDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 20,
  },
  profileStats: {
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginTop: 10,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },

  // Action Button Styles
  actionButtons: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});