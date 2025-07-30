import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { styles } from './ObjectiveListStyles'; // Import the existing styles

// Enhanced Date Picker Component with 3D Glass Effects for ObjectiveList
const DatePicker3D = ({ visible, onClose, onDateSelect, selectedDate, objectiveId }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const [year, setYear] = useState(selectedDate ? new Date(selectedDate).getFullYear() : currentYear);
  const [month, setMonth] = useState(selectedDate ? new Date(selectedDate).getMonth() : currentMonth);
  const [day, setDay] = useState(selectedDate ? new Date(selectedDate).getDate() : currentDate.getDate());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const handleDateConfirm = () => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(formattedDate, objectiveId);
    onClose();
  };

  const setToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setDay(today.getDate());
  };

  const changeYear = (increment) => {
    setYear(prev => prev + increment);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === day;
      const isToday = i === currentDate.getDate() && month === currentMonth && year === currentYear;
      const isFuture = new Date(year, month, i) > currentDate;
      
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            styles.calendarDayButton,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday,
          ]}
          onPress={() => setDay(i)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday,
            isFuture && { color: '#4CAF50' }, // Highlight future dates in green
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.datePickerOverlay}>
        <Animated.View
          style={[
            styles.datePickerContainer,
            {
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ],
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 25],
              }),
            },
          ]}
        >
          {/* Glass overlay */}
          <View style={[styles.glassOverlay, { borderRadius: 20, height: '40%' }]} />
          
          {/* Premium glow */}
          <Animated.View
            style={[
              styles.premiumGlow,
              {
                borderRadius: 23,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
              },
            ]}
          />

          {/* Header */}
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Target Date</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.datePickerCloseButton}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Month/Year Selectors */}
          <View style={styles.datePickerControls}>
            <View style={styles.datePickerControlGroup}>
              <Text style={styles.datePickerControlLabel}>Month</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.monthScroller}
              >
                {months.map((monthName, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthButton,
                      month === index && styles.monthButtonSelected,
                    ]}
                    onPress={() => setMonth(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.monthButtonText,
                      month === index && styles.monthButtonTextSelected,
                    ]}>
                      {monthName.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.datePickerControlGroup}>
              <Text style={styles.datePickerControlLabel}>Year</Text>
              <View style={styles.yearControls}>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => changeYear(-1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.yearButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => changeYear(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.yearButtonText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarHeaderText}>{day}</Text>
              ))}
            </View>
            <ScrollView style={{ maxHeight: 240 }}>
              <View style={styles.calendarGrid}>
                {renderCalendarDays()}
              </View>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.datePickerActions}>
            <TouchableOpacity
              style={styles.datePickerTodayButton}
              onPress={setToday}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerTodayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleDateConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          {/* 3D depth indicator */}
          <View style={[styles.depthIndicator, { borderRadius: 20, height: 3 }]} />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DatePicker3D;