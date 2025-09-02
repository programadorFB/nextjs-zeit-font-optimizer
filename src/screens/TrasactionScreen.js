import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useFinancial } from '../context/FinancialContext';
import ObjectiveModal from '../components/ObjectiveModal';
import GlassButton from '../components/GlassButton';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles, donutStyles } from './TransactionStyle';
import { useBetting } from '../context/BettingContext';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { GoldGradient } from '../components/GoldGradient';
// CHANGE 1: Import the ObjectivesList component
import ObjectivesList from '../components/ObjectiveList'; // Assuming the file is in the same folder

// Enhanced Date Picker Component with 3D Glass Effects
const DatePicker3D = ({ visible, onClose, onDateSelect, selectedDate }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
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
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.datePickerOverlay}>
        <Animated.View
          style={[
            styles.datePickerContainer,
            {
              transform: [{ scale: scaleAnim }],
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
            },
          ]}
        >
          {/* Glass overlay */}
          <View style={[styles.glassOverlay, { borderRadius: 20 }]} />
          
          {/* Premium glow */}
          <Animated.View
            style={[
              styles.premiumGlow,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
              },
            ]}
          />

          {/* Header */}
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Selecionar Data</Text>
            <TouchableOpacity onPress={onClose} style={styles.datePickerCloseButton}>
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
                  onPress={() => setYear(year - 1)}
                >
                  <Text style={styles.yearButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => setYear(year + 1)}
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
              onPress={() => {
                const today = new Date();
                setYear(today.getFullYear());
                setMonth(today.getMonth());
                setDay(today.getDate());
              }}
            >
              <Text style={styles.datePickerTodayText}>Hoje</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.datePickerConfirmButton}
              onPress={handleDateConfirm}
            >
              <Text style={styles.datePickerConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {/* 3D depth indicator */}
          <View style={[styles.depthIndicator, { borderRadius: 20 }]} />
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
    // Pulse animation for the calendar icon
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
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.dateInputContainer}>
      <View style={styles.dateInputWrapper}>
        <GlassInput
          value={formatDisplayDate(value)}
          placeholder="Selecione uma data"
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
          >
            {/* Premium glow */}
            <Animated.View
              style={[
                styles.premiumGlow,
                {
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
      <View style={[styles.depthIndicator, { borderRadius: 12 }]} />
    </Animated.View>
  );
};

// Enhanced Donut Chart Component for Objectives
const DonutChart = ({ progress, size = 80 }) => {
  const RADIUS = (size - 16) / 2 - 8;
  const STROKE_WIDTH = 6;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progressStroke = (CIRCUMFERENCE * progress) / 100;

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FFD700';
    if (progress >= 25) return '#FF9800';
    return '#F44336';
  };

  const getProgressGradientId = (progress) => {
    if (progress >= 80) return 'gradientGreen';
    if (progress >= 50) return 'gradientGold';
    if (progress >= 25) return 'gradientOrange';
    return 'gradientRed';
  };

  const progressColor = getProgressColor(progress);
  const center = size / 2;

  return (
    <View style={donutStyles.container}>
      <Svg height={size} width={size}>
        <Defs>
          <LinearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#66BB6A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4CAF50" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="gradientGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFEB3B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="gradientOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFA726" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FF9800" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="gradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EF5350" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F44336" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke="rgba(51, 51, 51, 0.8)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        
        {/* Progress circle with gradient */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={`url(#${getProgressGradientId(progress)})`}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${progressStroke}, ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center},${center}`}
          fill="none"
          opacity="0.9"
        />
        
        {/* Inner glow effect */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS - STROKE_WIDTH/2}
          stroke={progressColor}
          strokeWidth="1"
          strokeDasharray={`${progressStroke}, ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center},${center}`}
          fill="none"
          opacity="0.3"
        />
      </Svg>
      
      {/* Center text overlay */}
      <View style={[donutStyles.textOverlay, { width: size, height: size }]}>
        <Text style={[donutStyles.percentageText, { fontSize: size * 0.16 }]}>
          {`${Math.round(progress)}%`}
        </Text>
        <Text style={[donutStyles.labelText, { fontSize: size * 0.1 }]}>
          Meta
        </Text>
      </View>
    </View>
  );
};

export const categories = {
  deposit: ['Depósito Inicial', 'Recarga', 'Bônus', 'Ganhos', 'Transferência', 'Outros'],
  withdraw: ['Saque de Lucro', 'Stop-Loss', 'Pagamento','Perdas', 'Taxa', 'Transferência', 'Outros'],
};

const TransactionScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { addTransaction, addObjective, objectives, updateObjective, deleteObjective } = useFinancial();

  const [activeTab, setActiveTab] = useState(
    route.params?.showObjectives ? 'objectives' : 'transaction'
  );
  const [transactionType, setTransactionType] = useState(route.params?.type || 'deposit');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [objectiveModalVisible, setObjectiveModalVisible] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [isInitialBank, setIsInitialBank] = useState(false);
  
  useEffect(() => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDate(formattedToday);

    if (route.params?.type) setTransactionType(route.params.type);
    if (route.params?.showObjectives) setActiveTab('objectives');
  }, [route.params]);

  const handleAddTransaction = async () => {
    // Validação obrigatória: valor e data sempre obrigatórios
    if (!amount || !date) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // NOVA VALIDAÇÃO: Categoria é obrigatória para todos os tipos de transação
    if (!category) {
      Alert.alert(
        'Categoria Obrigatória', 
        'Por favor, selecione uma categoria antes de prosseguir com a transação.',
        [{ text: 'OK' }]
      );
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Erro', 'Informe um valor válido.');
      return;
    }

    setLoading(true);
    try {
      const result = await addTransaction({
        type: transactionType,
        amount: numericAmount,
        description: `${transactionType === 'deposit' ? 'Depósito' : 'Saque'} - ${category}`,
        category: category,
        date,
        isInitialBank,
      });

      if (result.success) {
        const successMessage = isInitialBank 
          ? 'Banca inicial definida com sucesso!' 
          : 'Transação adicionada com sucesso';
          
        Alert.alert('Sucesso', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setCategory('');
              setIsInitialBank(false);
              const today = new Date();
              const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setDate(formattedToday);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch {
      Alert.alert('Erro', 'Falha ao adicionar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // CHANGE 2: The old handleDeleteObjective function is no longer needed here.
  // It has been removed. The logic is now handled inside ObjectiveList.js

  const handleObjectiveAction = (obj = null) => {
    setEditingObjective(obj);
    setObjectiveModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderTransactionForm = () => (
    <ScrollView style={styles.formContainer}>
      {/* Transaction Type Selector */}
      <View style={styles.typeSelector}>
      <GoldGradient>
        <GlassButton
          style={[styles.typeButton, styles.depositButton, transactionType === 'deposit' && styles.typeButtonActive]}
          onPress={() => setTransactionType('deposit')}
          active={transactionType === 'deposit'}
        >
          <View style={{ alignItems: 'center' }}>
            <FontAwesome5 
              name="plus-circle" 
              size={20} 
              color={transactionType === 'deposit' ? '#000' : '#4CAF50'} 
            />
            <Text style={[styles.typeButtonText, transactionType === 'deposit' && { color: '#000' }]}>
              Depósito
            </Text>
          </View>
        </GlassButton>
      </GoldGradient>

        <GlassButton
          style={[styles.typeButton, styles.withdrawButton, transactionType === 'withdraw' && styles.typeButtonActive]}
          onPress={() => setTransactionType('withdraw')}
          active={transactionType === 'withdraw'}
        >
          <View style={{ alignItems: 'center' }}>
            <FontAwesome5 name="minus-circle" size={20} color={transactionType === 'withdraw' ? '#000' : '#F44336'} />
            <Text style={[styles.typeButtonText, transactionType === 'withdraw' && { color: '#000' }]}>
              Saque
            </Text>
          </View>
        </GlassButton>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <FontAwesome5 name="coins" size={14}  /> Valor *
        </Text>
        <GlassInput
          value={amount}
          onChangeText={setAmount}
          placeholder="R$ 0,00"
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
      </View>

      {/* Date Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <MaterialIcons name="event" size={14} color="#FFD700" /> Data *
        </Text>
        <DateInputWithPicker
          value={date}
          onDateChange={setDate}
        />
      </View>

      {/* Category Selection - AGORA OBRIGATÓRIA */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          <MaterialIcons name="category" size={14} color="#FFD700" /> Categoria *
        </Text>
        {!category && (
          <Text style={styles.categoryWarning}>
            ⚠️ Selecione uma categoria para continuar
          </Text>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryContainer}>
            {categories[transactionType].map(cat => (
              <GlassButton
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat)}
                active={category === cat}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </GlassButton>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Initial Bank Checkbox - Only for deposits */}
      {transactionType === 'deposit' && (
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsInitialBank(prev => !prev)}
          >
            <View style={[styles.checkbox, isInitialBank && styles.checkboxActive]}>
              {isInitialBank && (
                <MaterialIcons name="check" size={16} color="#000" />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.checkboxLabel}>
                <FontAwesome5 name="flag-checkered" size={14} color="#FFD700" /> Definir como banca inicial
              </Text>
              <Text style={styles.checkboxDescription}>
                Este valor será usado como referência para cálculos de performance
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Button - DESABILITADO SE NÃO TIVER CATEGORIA */}
      <GlassButton
        style={[
          styles.submitButton, 
          (loading || !category) && styles.submitButtonDisabled
        ]}
        onPress={handleAddTransaction}
        disabled={loading || !category}
        active={!loading && !!category}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome5 
            name={transactionType === 'deposit' ? 'plus' : 'minus'} 
            size={16} 
            color={!category ? "#666" : "#000"} 
            style={{ marginRight: 8 }} 
          />
          <Text style={[
            styles.submitButtonText,
            !category && { color: '#666' }
          ]}>
            {loading 
              ? 'Processando...' 
              : !category 
                ? 'Selecione uma categoria'
                : `Adicionar ${transactionType === 'deposit' ? 'Depósito' : 'Saque'}`
            }
          </Text>
        </View>
      </GlassButton>
    </ScrollView>
  );

  // CHANGE 3: Replace the entire renderObjectivesList function with a cleaner version
  // that uses the dedicated ObjectivesList component.
  const renderObjectivesList = () => (
    <ScrollView style={styles.objectivesContainer}>
      <GlassButton
        style={styles.addObjectiveButton}
        onPress={() => handleObjectiveAction()}
        active
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons name="add" size={20} color="#000" style={{ marginRight: 8 }} />
          <Text style={styles.addObjectiveButtonText}>Novo Objetivo</Text>
        </View>
      </GlassButton>
      
      <ObjectivesList 
        objectives={objectives}
        onUpdateObjective={updateObjective}
        onDeleteObjective={deleteObjective}
      />
    </ScrollView>
  );


  return (
    <View style={styles.container}>
      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <GlassButton
          style={[styles.tab, activeTab === 'transaction' && styles.activeTab]}
          onPress={() => setActiveTab('transaction')}
          active={activeTab === 'transaction'}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome5 name="exchange-alt" size={16} color={activeTab === 'transaction' ? '#000' : '#CCCCCC'} />
            <Text style={[styles.tabText, activeTab === 'transaction' && { color: '#000' }]}>
              {' '}Transações
            </Text>
          </View>
        </GlassButton>

        <GlassButton
          style={[styles.tab, activeTab === 'objectives' && styles.activeTab]}
          onPress={() => setActiveTab('objectives')}
          active={activeTab === 'objectives'}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="flag" size={16} color={activeTab === 'objectives' ? '#000' : '#CCCCCC'} />
            <Text style={[styles.tabText, activeTab === 'objectives' && { color: '#000' }]}>
              {' '}Objetivos
            </Text>
          </View>
        </GlassButton>
      </View>

      {/* Content */}
      {activeTab === 'transaction' ? renderTransactionForm() : renderObjectivesList()}

      {/* Objective Modal */}
      <ObjectiveModal
        visible={objectiveModalVisible}
        onClose={() => {
          setObjectiveModalVisible(false);
          setEditingObjective(null);
        }}
        objective={editingObjective}
        onSave={async (data) => {
          const result = editingObjective
            ? await updateObjective(editingObjective.id, data)
            : await addObjective(data);

          if (result.success) {
            setObjectiveModalVisible(false);
            setEditingObjective(null);
          } else {
            Alert.alert('Erro', result.error);
          }
        }}
      />
    </View>
  );
};

export default TransactionScreen;