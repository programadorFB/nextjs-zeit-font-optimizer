import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';

// Enhanced Date Picker Component with 3D Glass Effects
const DatePicker3D = ({ visible, onClose, onDateSelect, selectedDate }) => {
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
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  useEffect(() => {
    if (visible) {
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
    onDateSelect(formattedDate);
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

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === day;
      const isToday = i === currentDate.getDate() && month === currentMonth && year === currentYear;
      const isFuture = new Date(year, month, i) >= currentDate;
      
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
            isFuture && !isToday && { color: '#4CAF50' },
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
            <Text style={styles.datePickerTitle}>Selecionar Data Meta</Text>
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
              <Text style={styles.datePickerControlLabel}>Mês</Text>
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
              <Text style={styles.datePickerControlLabel}>Ano</Text>
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
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
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
              <Text style={styles.datePickerTodayText}>Hoje</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleDateConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* 3D depth indicator */}
          <View style={[styles.depthIndicator, { borderRadius: 20, height: 3 }]} />
        </Animated.View>
      </View>
    </Modal>
  );
};

// Enhanced Date Input Component with Interactive Icon
const DateInputWithPicker = ({ value, onDateChange, style, ...props }) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const iconPulseAnim = useRef(new Animated.Value(1)).current;
  const iconGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleIconPress = () => {
    Animated.sequence([
      Animated.timing(iconGlowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(iconGlowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
    
    setPickerVisible(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.dateInputContainer}>
      <View style={styles.dateInputWrapper}>
        <GlassInput
          value={formatDisplayDate(value)}
          placeholder="Selecione a data meta"
          placeholderTextColor="#666"
          editable={false}
          style={[styles.dateInput, style]}
          {...props}
        />
        
        <Animated.View
          style={[
            styles.calendarIconContainer,
            {
              transform: [{ scale: iconPulseAnim }],
              shadowOpacity: iconGlowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.calendarIcon}
            onPress={handleIconPress}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.premiumGlow,
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  top: -3,
                  left: -3,
                  opacity: iconGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.4],
                  }),
                },
              ]}
            />
            <Text style={styles.calendarIconText}>📅</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <DatePicker3D
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onDateSelect={onDateChange}
        selectedDate={value}
      />
    </View>
  );
};

// Enhanced Glass Input Component
const GlassInput = ({ style, ...props }) => {
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View
      style={{
        shadowColor: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['#000', '#FFD700'],
        }),
        shadowOpacity: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.6],
        }),
        shadowRadius: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 15],
        }),
        elevation: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 12],
        }),
      }}
    >
      <View style={[styles.glassOverlay, { borderRadius: 12 }]} />
      <TextInput
        style={[styles.input, style]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      <View style={[styles.depthIndicator, { borderRadius: 12, height: 2 }]} />
    </Animated.View>
  );
};

// Enhanced Glass Button Component
const GlassButton = ({ children, style, onPress, active = false, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...props}
      >
        <View style={[styles.glassOverlay, { borderRadius: style?.borderRadius || 10 }]} />
        <View style={[styles.depthIndicator, { borderRadius: style?.borderRadius || 10 }]} />
        {(active || glowAnim) && (
          <Animated.View
            style={[
              styles.premiumGlow,
              {
                borderRadius: (style?.borderRadius || 10) + 3,
                opacity: active ? 0.3 : glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />
        )}
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ObjectiveModal = ({ visible, onClose, objective, onSave }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (objective) {
      setTitle(objective.title || '');
      setTargetAmount(objective.target_amount?.toString() || '');
      setCurrentAmount(objective.current_amount?.toString() || '');
      
      if (objective.deadline) {
        const date = new Date(objective.deadline);
        const formattedDate = date.toISOString().split('T')[0];
        setDeadline(formattedDate);
      }
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
    }
  }, [objective, visible]);

  useEffect(() => {
    if (visible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    } else {
      Animated.timing(modalScaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim() || !targetAmount || !deadline) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const numericTargetAmount = parseFloat(targetAmount);
    const numericCurrentAmount = parseFloat(currentAmount) || 0;

    if (isNaN(numericTargetAmount) || numericTargetAmount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor meta válido');
      return;
    }

    if (numericCurrentAmount < 0) {
      Alert.alert('Erro', 'O valor atual não pode ser negativo');
      return;
    }

    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert('Erro', 'A data meta não pode ser no passado');
      return;
    }

    setLoading(true);

    try {
      const objectiveData = {
        title: title.trim(),
        target_amount: numericTargetAmount,
        current_amount: numericCurrentAmount,
        deadline: deadline,
      };

      await onSave(objectiveData);
    } catch (error) {
      console.error('Error saving objective:', error);
      Alert.alert('Erro', 'Falha ao salvar objetivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    onClose();
  };

  const generateSuggestedDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const progressPercentage = targetAmount && currentAmount 
    ? Math.min((parseFloat(currentAmount) / parseFloat(targetAmount)) * 100, 100)
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      transparent
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: modalScaleAnim }],
            },
          ]}
        >
          {/* Glass overlay for modal */}
          <View style={[styles.glassOverlay, { borderRadius: 20, height: '30%' }]} />
          
          {/* Premium glow for modal */}
          <View style={[styles.premiumGlow, { borderRadius: 23 }]} />

          <View style={styles.header}>
            <GlassButton
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </GlassButton>
            
            <Text style={styles.title}>
              {objective ? 'Editar Objetivo' : 'Novo Objetivo'}
            </Text>
            
            <GlassButton
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
              active
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </GlassButton>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título do Objetivo *</Text>
              <GlassInput
                value={title}
                onChangeText={setTitle}
                placeholder="ex: Reserva de Emergência, Viagem, Carro Novo"
                placeholderTextColor="#666"
                maxLength={100}
              />
            </View>

            {/* Target Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor Meta *</Text>
              <GlassInput
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            {/* Current Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor Atual</Text>
              <GlassInput
                value={currentAmount}
                onChangeText={setCurrentAmount}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>
                Quanto você já tem economizado para este objetivo
              </Text>
            </View>

            {/* Enhanced Deadline Input with Calendar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Data Meta *</Text>
              <DateInputWithPicker
                value={deadline}
                onDateChange={setDeadline}
              />
              
              {/* Quick Date Suggestions */}
              <View style={styles.dateSuggestions}>
                <Text style={styles.suggestionLabel}>Seleção rápida:</Text>
                <View style={styles.suggestionButtons}>
                  <GlassButton
                    style={styles.suggestionButton}
                    onPress={() => setDeadline(generateSuggestedDate(3))}
                  >
                    <Text style={styles.suggestionButtonText}>3 meses</Text>
                  </GlassButton>
                  
                  <GlassButton
                    style={styles.suggestionButton}
                    onPress={() => setDeadline(generateSuggestedDate(6))}
                  >
                    <Text style={styles.suggestionButtonText}>6 meses</Text>
                  </GlassButton>
                  
                  <GlassButton
                    style={styles.suggestionButton}
                    onPress={() => setDeadline(generateSuggestedDate(12))}
                  >
                    <Text style={styles.suggestionButtonText}>1 ano</Text>
                  </GlassButton>
                </View>
              </View>
            </View>

            {/* Enhanced Progress Preview */}
            {targetAmount && currentAmount && (
              <View style={styles.previewContainer}>
                <View style={[styles.glassOverlay, { borderRadius: 10, height: '40%' }]} />
                <View style={[styles.depthIndicator, { borderRadius: 10 }]} />
                
                <Text style={styles.previewTitle}>Prévia do Progresso</Text>
                <View style={styles.progressPreview}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: progressPercentage >= 80 ? '#4CAF50' : 
                                         progressPercentage >= 50 ? '#FFD700' : 
                                         progressPercentage >= 25 ? '#FF9800' : '#F44336',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progressPercentage.toFixed(1)}% concluído
                  </Text>
                </View>
              </View>
            )}

            {/* Enhanced Tips Section */}
            <View style={styles.tipsContainer}>
              <View style={[styles.glassOverlay, { borderRadius: 10, height: '40%' }]} />
              <View style={[styles.depthIndicator, { borderRadius: 10 }]} />
              
              <Text style={styles.tipsTitle}>💡 Dicas para o Sucesso</Text>
              <Text style={styles.tipText}>
                • Defina prazos realistas e alcançáveis
              </Text>
              <Text style={styles.tipText}>
                • Divida objetivos grandes em marcos menores
              </Text>
              <Text style={styles.tipText}>
                • Revise e atualize seu progresso regularmente
              </Text>
              <Text style={styles.tipText}>
                • Comemore quando alcançar seus objetivos!
              </Text>
            </View>
          </ScrollView>
          
          {/* 3D depth indicator for modal */}
          <View style={[styles.depthIndicator, { borderRadius: 20, height: 3 }]} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  saveButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.2,
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
    position: 'relative',
  },
  helperText: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Date Input Styles
  dateInputContainer: {
    position: 'relative',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  dateInput: {
    flex: 1,
    paddingRight: 60,
  },
  calendarIconContainer: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  calendarIconText: {
    fontSize: 18,
    zIndex: 2,
  },

  // Date Suggestions
  dateSuggestions: {
    marginTop: 15,
  },
  suggestionLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
    fontWeight: '500',
  },
  suggestionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  suggestionButtonText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Enhanced Preview Container
  previewContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
  },
  previewTitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressPreview: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Enhanced Tips Container
  tipsContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
  },
  tipsTitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 15,
    textShadowColor: 'rgba(76, 175, 80, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // 3D Glass Effects
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  depthIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  premiumGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    zIndex: -1,
  },

  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  datePickerContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  datePickerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  datePickerCloseText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  datePickerControls: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  datePickerControlGroup: {
    marginBottom: 15,
  },
  datePickerControlLabel: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 10,
    fontWeight: '600',
  },
  monthScroller: {
    maxHeight: 50,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  monthButtonText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  monthButtonTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  yearControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginHorizontal: 15,
  },
  yearButtonText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'center',
  },

  // Calendar Styles
  calendarContainer: {
    padding: 20,
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
    marginBottom: 10,
  },
  calendarHeaderText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    marginVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayButton: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarDaySelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
  },
  calendarDayToday: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  calendarDayText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },

  // Date Picker Actions
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.2)',
  },
  datePickerTodayButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  datePickerTodayText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  datePickerConfirmText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ObjectiveModal;