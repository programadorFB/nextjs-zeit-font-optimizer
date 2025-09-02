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
  SafeAreaView,
} from 'react-native';
import { useFinancial } from '../context/FinancialContext';

// Simplified Date Picker Component
const SimpleDatePicker = ({ visible, onClose, onDateSelect, selectedDate }) => {
  const [year, setYear] = useState(selectedDate ? new Date(selectedDate).getFullYear() : new Date().getFullYear());
  const [month, setMonth] = useState(selectedDate ? new Date(selectedDate).getMonth() : new Date().getMonth());
  const [day, setDay] = useState(selectedDate ? new Date(selectedDate).getDate() : new Date().getDate());

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
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
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
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.datePickerOverlay}>
        <View style={styles.datePickerContainer}>
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
            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
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
        </View>
      </View>
    </Modal>
  );
};

// Enhanced Date Input Component
const DateInputWithPicker = ({ value, onDateChange, style, ...props }) => {
  const [pickerVisible, setPickerVisible] = useState(false);

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
        <TextInput
          value={formatDisplayDate(value)}
          placeholder="Selecione a data meta"
          placeholderTextColor="#666"
          editable={false}
          style={[styles.input, styles.dateInput, style]}
          {...props}
        />
        
        <TouchableOpacity
          style={styles.calendarIcon}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.calendarIconText}>📅</Text>
        </TouchableOpacity>
      </View>

      <SimpleDatePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onDateSelect={onDateChange}
        selectedDate={value}
      />
    </View>
  );
};

const ObjectiveModal = ({ visible, onClose, objective = null }) => {
  const { addObjective, updateObjective, loading: contextLoading } = useFinancial();
  
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const modalScaleAnim = useRef(new Animated.Value(0)).current;

  console.log('ObjectiveModal rendered with:', { visible, objective });

  // Reset form data
  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setErrors({});
    setHasUnsavedChanges(false);
  };

  // Populate form when editing an objective
  useEffect(() => {
    console.log('useEffect triggered with visible:', visible, 'objective:', objective);
    
    if (visible) {
      if (objective) {
        console.log('Editing objective:', objective);
        
        setTitle(objective.title || '');
        setTargetAmount(objective.target_amount?.toString() || '');
        setCurrentAmount(objective.current_amount?.toString() || '0');
        
        // Handle different date field names from backend
        let dateToSet = '';
        if (objective.target_date) {
          dateToSet = objective.target_date;
        } else if (objective.deadline) {
          dateToSet = objective.deadline;
        }
        
        if (dateToSet) {
          const date = new Date(dateToSet);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split('T')[0];
            setDeadline(formattedDate);
            console.log('Set deadline to:', formattedDate);
          }
        }
      } else {
        console.log('Creating new objective, resetting form');
        resetForm();
      }
      setErrors({});
      setHasUnsavedChanges(false);
    }
  }, [objective, visible]);

  // Track changes for unsaved warning (apenas para edição)
  useEffect(() => {
    if (visible && !loading && objective) { // Só monitora mudanças quando está editando
      const hasChanges = title.trim() !== (objective.title || '') || 
                        targetAmount !== (objective.target_amount?.toString() || '') || 
                        currentAmount !== (objective.current_amount?.toString() || '0') || 
                        deadline !== '';
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, targetAmount, currentAmount, deadline, visible, loading, objective]);

  // Modal animation (safe animations only)
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

  // Validação simplificada (apenas na hora de salvar)
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    const cleanTargetAmount = targetAmount.replace(/[^\d.,]/g, '').replace(',', '.');
    const numericTargetAmount = parseFloat(cleanTargetAmount);
    
    if (!targetAmount || isNaN(numericTargetAmount) || numericTargetAmount <= 0) {
      newErrors.targetAmount = 'Valor meta deve ser maior que zero';
    }

    if (!deadline) {
      newErrors.deadline = 'Data meta é obrigatória';
    } else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        newErrors.deadline = 'Data inválida';
      } else if (selectedDate < today) {
        newErrors.deadline = 'Data meta não pode ser no passado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('Save attempt started');
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setLoading(true);

    try {
      const cleanTargetAmount = targetAmount.replace(/[^\d.,]/g, '').replace(',', '.');
      const cleanCurrentAmount = currentAmount.replace(/[^\d.,]/g, '').replace(',', '.');
      
      const numericTargetAmount = parseFloat(cleanTargetAmount);
      const numericCurrentAmount = parseFloat(cleanCurrentAmount) || 0;

      const objectiveData = {
        title: title.trim(),
        target_amount: numericTargetAmount,
        current_amount: numericCurrentAmount,
        target_date: deadline,
        priority: 'medium',
        category: 'general',
      };

      console.log('Sending objective data:', objectiveData);

      let result;
      if (objective?.id) {
        console.log('Updating objective with ID:', objective.id);
        result = await updateObjective(objective.id, objectiveData);
      } else {
        console.log('Creating new objective');
        result = await addObjective(objectiveData);
      }

      console.log('API result:', result);

      if (result && result.success) {
        Alert.alert(
          'Sucesso!', 
          objective?.id ? 'Objetivo atualizado com sucesso!' : 'Objetivo criado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => handleClose()
            }
          ]
        );
      } else {
        throw new Error(result?.error || 'Falha ao salvar objetivo');
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      Alert.alert(
        'Erro', 
        error.message || 'Falha ao salvar objetivo. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Apenas avisa sobre mudanças não salvas se estiver editando um objetivo existente
    if (hasUnsavedChanges && !loading && !objective) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja realmente sair?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  const generateSuggestedDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const formatCurrencyInput = (value) => {
    return value.replace(/[^\d.,]/g, '');
  };

  // Enhanced progress calculation
  const calculateProgress = () => {
    if (!targetAmount || !currentAmount) return { percentage: 0, isValid: false };
    
    const cleanTarget = targetAmount.replace(/[^\d.,]/g, '').replace(',', '.');
    const cleanCurrent = currentAmount.replace(/[^\d.,]/g, '').replace(',', '.');
    
    const target = parseFloat(cleanTarget);
    const current = parseFloat(cleanCurrent);
    
    if (isNaN(target) || isNaN(current) || target <= 0) {
      return { percentage: 0, isValid: false };
    }
    
    const percentage = Math.min((current / target) * 100, 100);
    return { 
      percentage: Math.max(0, percentage), 
      isValid: true,
      target,
      current
    };
  };

  const progressData = calculateProgress();
  const isFormValid = title.trim() && targetAmount && deadline && !loading && !contextLoading;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>
                {objective?.id ? 'Editar Objetivo' : 'Novo Objetivo'}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  (!isFormValid) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={!isFormValid}
              >
                <Text style={[styles.saveButtonText, (!isFormValid) && styles.saveButtonTextDisabled]}>
                  {loading || contextLoading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={true}
              bounces={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Title Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Título do Objetivo *
                  {errors.title && <Text style={styles.errorText}> - {errors.title}</Text>}
                </Text>
                <TextInput
                  value={title}
                  onChangeText={(value) => {
                    setTitle(value);
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: null }));
                    }
                  }}
                  placeholder="ex: Reserva de Emergência, Viagem, Carro Novo"
                  placeholderTextColor="#666"
                  maxLength={100}
                  style={[styles.input, errors.title ? styles.inputError : null]}
                />
              </View>

              {/* Target Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Valor Meta *
                  {errors.targetAmount && <Text style={styles.errorText}> - {errors.targetAmount}</Text>}
                </Text>
                <TextInput
                  value={targetAmount}
                  onChangeText={(value) => {
                    setTargetAmount(formatCurrencyInput(value));
                    if (errors.targetAmount) {
                      setErrors(prev => ({ ...prev, targetAmount: null }));
                    }
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  style={[styles.input, errors.targetAmount ? styles.inputError : null]}
                />
              </View>

              {/* Current Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Valor Atual</Text>
                <TextInput
                  value={currentAmount}
                  onChangeText={(value) => {
                    setCurrentAmount(formatCurrencyInput(value));
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <Text style={styles.helperText}>
                  Quanto você já tem economizado para este objetivo
                </Text>
              </View>

              {/* Enhanced Deadline Input with Calendar */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Data Meta *
                  {errors.deadline && <Text style={styles.errorText}> - {errors.deadline}</Text>}
                </Text>
                <DateInputWithPicker
                  value={deadline}
                  onDateChange={(date) => {
                    setDeadline(date);
                    if (errors.deadline) {
                      setErrors(prev => ({ ...prev, deadline: null }));
                    }
                  }}
                  style={errors.deadline ? styles.inputError : null}
                />
                
                {/* Quick Date Suggestions */}
                <View style={styles.dateSuggestions}>
                  <Text style={styles.suggestionLabel}>Seleção rápida:</Text>
                  <View style={styles.suggestionButtons}>
                    <TouchableOpacity
                      style={styles.suggestionButton}
                      onPress={() => setDeadline(generateSuggestedDate(3))}
                    >
                      <Text style={styles.suggestionButtonText}>3 meses</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.suggestionButton}
                      onPress={() => setDeadline(generateSuggestedDate(6))}
                    >
                      <Text style={styles.suggestionButtonText}>6 meses</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.suggestionButton}
                      onPress={() => setDeadline(generateSuggestedDate(12))}
                    >
                      <Text style={styles.suggestionButtonText}>1 ano</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Enhanced Progress Preview */}
              {progressData.isValid && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>Prévia do Progresso</Text>
                  <View style={styles.progressPreview}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.max(0, Math.min(100, progressData.percentage))}%`,
                            backgroundColor: progressData.percentage >= 80 ? '#4CAF50' : 
                                           progressData.percentage >= 50 ? '#FFD700' : 
                                           progressData.percentage >= 25 ? '#FF9800' : '#F44336',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.max(0, Math.min(100, progressData.percentage)).toFixed(1)}% concluído
                    </Text>
                    <Text style={styles.progressSubtext}>
                      R$ {progressData.current?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {progressData.target?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              )}

              {/* Enhanced Tips Section */}
              <View style={styles.tipsContainer}>
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

              {/* Enhanced Network Status Indicator */}
              {(loading || contextLoading) && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    {objective?.id ? 'Atualizando objetivo...' : 'Criando objetivo...'}
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    Por favor, aguarde
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 50,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderRadius: 20,
    height: '85%',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
    textAlign: 'center',
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
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
    shadowOpacity: 0.2,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: 14,
  },
  saveButtonTextDisabled: {
    color: '#888888',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
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
  },
  inputError: {
    borderColor: 'rgba(244, 67, 54, 0.5)',
    borderTopColor: 'rgba(244, 67, 54, 0.3)',
    shadowColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '500',
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
  calendarIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
  },
  calendarIconText: {
    fontSize: 18,
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
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
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

  // Loading Container
  loadingContainer: {
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
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
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
    flex: 1,
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
    maxHeight: 300,
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  calendarDay: {
    width: '14.28%', // 100% / 7 days = 14.28%
    aspectRatio: 1,
    marginVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayButton: {
    width: '80%',
    height: '80%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
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