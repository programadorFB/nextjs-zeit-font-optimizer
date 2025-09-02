// ObjectiveList.js - VERSÃO CORRIGIDA PARA DELETAR OBJETIVOS E ATUALIZAR A UI

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from './ObjectiveListStyles';

const { width } = Dimensions.get('window');

// Modal para editar objetivo - MELHORADO
const EditObjectiveModal = ({ visible, objective, onClose, onSave }) => {
  const [editedObjective, setEditedObjective] = useState(objective || {});
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (objective) {
      setEditedObjective(objective);
      setErrors({});
    }
  }, [objective]);

  const validateFields = () => {
    const newErrors = {};

    if (!editedObjective.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!editedObjective.target_amount || editedObjective.target_amount <= 0) {
      newErrors.target_amount = 'Meta deve ser maior que zero';
    }

    if (editedObjective.current_amount < 0) {
      newErrors.current_amount = 'Valor atual não pode ser negativo';
    }

    if (!editedObjective.target_date) {
      newErrors.target_date = 'Data limite é obrigatória';
    } else {
      const selectedDate = new Date(editedObjective.target_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.target_date = 'Data limite deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) {
      Alert.alert('Erro', 'Por favor, corrija os erros antes de salvar.');
      return;
    }

    const dataToSave = {
      ...editedObjective,
      title: editedObjective.title.trim(),
      current_amount: parseFloat(editedObjective.current_amount) || 0,
      target_amount: parseFloat(editedObjective.target_amount),
    };

    onSave(dataToSave);
    onClose();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleDateChange = (dateString) => {
    setEditedObjective(prev => ({ ...prev, target_date: dateString }));
    if (errors.target_date) {
      setErrors(prev => ({ ...prev, target_date: null }));
    }
  };

  const handleAmountChange = (field, text) => {
    const cleaned = text.replace(/[^\d.,]/g, '');
    const normalized = cleaned.replace(',', '.');
    const numericValue = parseFloat(normalized) || 0;
    
    setEditedObjective(prev => ({ ...prev, [field]: numericValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const calculateProgress = () => {
    const current = editedObjective.current_amount || 0;
    const target = editedObjective.target_amount || 1;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 50) return '#FFD700';
    if (progress >= 25) return '#FF9800';
    return '#F44336';
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Editar Objetivo</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Título */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Título do Objetivo *</Text>
              <TextInput
                style={[modalStyles.textInput, errors.title && modalStyles.inputError]}
                value={editedObjective.title || ''}
                onChangeText={(text) => {
                  setEditedObjective(prev => ({ ...prev, title: text }));
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: null }));
                  }
                }}
                placeholder="Ex: Comprar um carro"
                placeholderTextColor="#666"
              />
              {errors.title && (
                <Text style={modalStyles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Valor Atual */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Valor Atual (R$)</Text>
              <TextInput
                style={[modalStyles.textInput, errors.current_amount && modalStyles.inputError]}
                value={editedObjective.current_amount?.toString() || ''}
                onChangeText={(text) => handleAmountChange('current_amount', text)}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              {errors.current_amount && (
                <Text style={modalStyles.errorText}>{errors.current_amount}</Text>
              )}
            </View>

            {/* Meta */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Meta (R$) *</Text>
              <TextInput
                style={[modalStyles.textInput, errors.target_amount && modalStyles.inputError]}
                value={editedObjective.target_amount?.toString() || ''}
                onChangeText={(text) => handleAmountChange('target_amount', text)}
                placeholder="10000,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              {errors.target_amount && (
                <Text style={modalStyles.errorText}>{errors.target_amount}</Text>
              )}
            </View>

            {/* Data Limite */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Data Limite *</Text>
              <TextInput
                style={[modalStyles.textInput, errors.target_date && modalStyles.inputError]}
                value={formatDateForInput(editedObjective.target_date)}
                onChangeText={handleDateChange}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#666"
              />
              {errors.target_date && (
                <Text style={modalStyles.errorText}>{errors.target_date}</Text>
              )}
              <Text style={modalStyles.helperText}>
                Formato: Ano-Mês-Dia (ex: 2025-12-31)
              </Text>
            </View>

            {/* Prévia do Progresso */}
            <View style={modalStyles.previewContainer}>
              <Text style={modalStyles.previewLabel}>Prévia do Objetivo:</Text>
              <View style={modalStyles.previewCard}>
                <Text style={modalStyles.previewTitle}>
                  {editedObjective.title || 'Título do Objetivo'}
                </Text>
                <View style={modalStyles.previewProgress}>
                  <Text style={modalStyles.previewAmount}>
                    {formatCurrency(editedObjective.current_amount || 0)} de {formatCurrency(editedObjective.target_amount || 0)}
                  </Text>
                  <View style={modalStyles.progressBarContainer}>
                    <View style={modalStyles.progressBarBackground}>
                      <View style={[
                        modalStyles.progressBarFill,
                        {
                          width: `${calculateProgress()}%`,
                          backgroundColor: getProgressColor(calculateProgress())
                        }
                      ]} />
                    </View>
                    <Text style={[
                      modalStyles.previewPercentage,
                      { color: getProgressColor(calculateProgress()) }
                    ]}>
                      {calculateProgress().toFixed(1)}% Concluído
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={modalStyles.modalActions}>
            <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
              <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
              <Text style={modalStyles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Componente de objetivo individual - CORRIGIDO PARA DELETAR
const ObjectiveItem = ({ item, onUpdateObjective, onDeleteObjective, onObjectiveDeleted }) => {
  const RADIUS = 35;
  const STROKE_WIDTH = 8;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const [showActions, setShowActions] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [actionsOpacity] = useState(new Animated.Value(0));
  const [isDeleting, setIsDeleting] = useState(false);

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
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  const getProgressStyles = (progress) => {
    if (progress >= 80) return {
      container: styles.progressGood,
      text: styles.progressTextGood
    };
    if (progress >= 50) return {
      container: styles.progressMedium,
      text: styles.progressTextMedium
    };
    if (progress >= 25) return {
      container: styles.progressLow,
      text: styles.progressTextLow
    };
    return {
      container: styles.progressCritical,
      text: styles.progressTextCritical
    };
  };

  const getObjectiveStyles = (progress, daysRemaining) => {
    let objectiveStyles = [itemStyles.objectiveItem];

    if (progress >= 100) {
      objectiveStyles.push(itemStyles.completedObjective);
    } else if (daysRemaining < 7) {
      objectiveStyles.push(itemStyles.urgentObjective);
    }

    return objectiveStyles;
  };

  const getDeadlineStyles = (daysRemaining) => {
    if (daysRemaining < 0) return itemStyles.overdueDeadline;
    if (daysRemaining === 0) return itemStyles.dueTodayDeadline;
    if (daysRemaining < 7) return itemStyles.urgentDeadline;
    return itemStyles.normalDeadline;
  };

  const handleLongPress = () => {
    // Animação de feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Mostrar ações com animação
    setShowActions(true);
    Animated.timing(actionsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideActions = () => {
    Animated.timing(actionsOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowActions(false);
    });
  };

  const handleEdit = () => {
    hideActions();
    setTimeout(() => setEditModalVisible(true), 200);
  };

  const handleDelete = () => {
    hideActions();
    setTimeout(() => {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o objetivo "${item.title}"?\n\nProgresso atual: ${formatCurrency(item.current_amount)} de ${formatCurrency(item.target_amount)}\n\nEsta ação não pode ser desfeita.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('Cancelou exclusão')
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: confirmDelete
          }
        ]
      );
    }, 200);
  };

  // FUNÇÃO CORRIGIDA PARA DELETAR
  const confirmDelete = async () => {
    if (isDeleting) return; // Evitar múltiplas chamadas

    setIsDeleting(true);

    try {
      console.log('Iniciando exclusão do objetivo:', item.id);

      // Chamar a função de deletar passada via props
      const result = await onDeleteObjective(item.id);

      console.log('Resultado da exclusão:', result);

      if (result && result.success) {
        // Animação de saída
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Chamar callback para atualizar a lista
        if (onObjectiveDeleted) {
          onObjectiveDeleted(item.id);
        }

        setTimeout(() => {
          Alert.alert('Sucesso', 'Objetivo excluído com sucesso!');
        }, 300);
      } else {
        const errorMessage = result?.error || result?.message || 'Não foi possível excluir o objetivo.';
        console.error('Erro na exclusão:', errorMessage);
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao excluir objetivo:', error);
      Alert.alert('Erro', `Não foi possível excluir o objetivo: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveObjective = async (editedObjective) => {
    try {
      const result = await onUpdateObjective(editedObjective.id, editedObjective);
      if (result && result.success) {
        Alert.alert('Sucesso', 'Objetivo atualizado com sucesso!');
      } else {
        const errorMessage = result?.error || result?.message || 'Não foi possível atualizar o objetivo.';
        Alert.alert('Erro', errorMessage);
      }
    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      Alert.alert('Erro', `Não foi possível atualizar o objetivo: ${error.message}`);
    }
  };

  const progress = calculateProgress(item.current_amount, item.target_amount);
  const daysRemaining = getDaysRemaining(item.target_date || item.deadline);
  const progressColor = getProgressColor(progress);
  const progressStroke = (CIRCUMFERENCE * progress) / 100;
  const progressStyles = getProgressStyles(progress);
  const objectiveStyles = getObjectiveStyles(progress, daysRemaining);
  const deadlineStyles = getDeadlineStyles(daysRemaining);

  return (
    <>
      <Animated.View style={[
        objectiveStyles,
        { transform: [{ scale: scaleAnim }] },
        isDeleting && { opacity: 0.5 }
      ]}>
        <TouchableOpacity
          style={itemStyles.objectiveTouchable}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          delayLongPress={400}
          disabled={isDeleting}
        >
          {/* Glass overlay effect */}
          <View style={itemStyles.glassOverlay} />

          {/* Status indicator */}
          <View style={[
            itemStyles.statusIndicator,
            progress >= 80 ? itemStyles.statusCompleted :
            progress >= 50 ? itemStyles.statusOnTrack :
            progress >= 25 ? itemStyles.statusBehind :
            itemStyles.statusCritical
          ]} />

          {/* Depth indicator */}
          <View style={itemStyles.depthIndicator} />

          <View style={itemStyles.objectiveHeader}>
            <Text style={itemStyles.objectiveTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[itemStyles.progressContainer, progressStyles.container]}>
              <Text style={[itemStyles.objectiveProgress, progressStyles.text]}>
                {progress.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Enhanced Donut Chart */}
          <View style={itemStyles.donutContainer}>
            <Svg height="90" width="90" style={{ marginBottom: 10 }}>
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
                cx="45"
                cy="45"
                r={RADIUS}
                stroke="rgba(51, 51, 51, 0.8)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />

              {/* Progress circle with gradient */}
              <Circle
                cx="45"
                cy="45"
                r={RADIUS}
                stroke={`url(#${getProgressGradientId(progress)})`}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={`${progressStroke}, ${CIRCUMFERENCE}`}
                strokeLinecap="round"
                rotation="-90"
                origin="45,45"
                fill="none"
                opacity="0.9"
              />

              {/* Inner glow effect */}
              <Circle
                cx="45"
                cy="45"
                r={RADIUS - STROKE_WIDTH/2}
                stroke={progressColor}
                strokeWidth="1"
                strokeDasharray={`${progressStroke}, ${CIRCUMFERENCE}`}
                strokeLinecap="round"
                rotation="-90"
                origin="45,45"
                fill="none"
                opacity="0.3"
              />
            </Svg>

            {/* Center text overlay */}
            <View style={itemStyles.donutTextOverlay}>
              <Text style={[itemStyles.donutText, { fontSize: 16, fontWeight: 'bold' }]}>
                {`${Math.round(progress)}%`}
              </Text>
              <Text style={[itemStyles.donutText, { fontSize: 10, color: '#AAAAAA', marginTop: 2 }]}>
                Completo
              </Text>
            </View>
          </View>

          <View style={itemStyles.objectiveDetails}>
            <View style={itemStyles.amountContainer}>
              <Text style={itemStyles.currentAmount}>
                {formatCurrency(item.current_amount)}
              </Text>
              <Text style={itemStyles.targetAmount}>
                de {formatCurrency(item.target_amount)}
              </Text>
            </View>

            <View style={itemStyles.deadlineContainer}>
              <Text style={[itemStyles.deadline, deadlineStyles]}>
                {daysRemaining > 0
                  ? `${daysRemaining} dias restantes`
                  : daysRemaining === 0
                  ? 'Vence hoje'
                  : `${Math.abs(daysRemaining)} dias em atraso`
                }
              </Text>
            </View>
          </View>

          <View style={itemStyles.deadlineDateContainer}>
            <View style={itemStyles.dateDisplayTouchable}>
              <Text style={itemStyles.deadlineDate}>
                Meta: {formatDate(item.target_date || item.deadline)}
              </Text>
              <View style={itemStyles.calendarIconSmall}>
                <MaterialIcons name="event" size={16} color="#FFD700" />
              </View>
            </View>
            <Text style={itemStyles.longPressHint}>
              Pressione e segure para editar
            </Text>
          </View>

          {/* Indicador de loading durante exclusão */}
          {isDeleting && (
            <View style={itemStyles.loadingOverlay}>
              <Text style={itemStyles.loadingText}>Excluindo...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Ações que aparecem apenas no long press */}
        {showActions && !isDeleting && (
          <>
            {/* Overlay para fechar ações */}
            <TouchableOpacity
              style={itemStyles.actionsOverlay}
              onPress={hideActions}
              activeOpacity={1}
            />

            {/* Botões de ação animados */}
            <Animated.View style={[
              itemStyles.actionButtonsContainer,
              { opacity: actionsOpacity }
            ]}>
              <TouchableOpacity
                style={itemStyles.editActionButton}
                onPress={handleEdit}
              >
                <MaterialIcons name="edit" size={20} color="#FFD700" />
                <Text style={itemStyles.actionButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={itemStyles.deleteActionButton}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={20} color="#F44336" />
                <Text style={itemStyles.actionButtonText}>Excluir</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </Animated.View>

      {/* Modal de Edição */}
      <EditObjectiveModal
        visible={editModalVisible}
        objective={item}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveObjective}
      />
    </>
  );
};

// Componente principal da lista - CORRIGIDO E MELHORADO
const ObjectivesList = ({ objectives, onUpdateObjective, onDeleteObjective, onRefresh }) => {
  // ALTERAÇÃO 1: Adicionar um estado local para a lista de objetivos
  const [localObjectives, setLocalObjectives] = useState(objectives);
  const [refreshingList, setRefreshingList] = useState(false);

  // ALTERAÇÃO 2: Sincronizar o estado local quando a prop 'objectives' mudar
  useEffect(() => {
    setLocalObjectives(objectives);
  }, [objectives]);

  // Função para lidar com a exclusão e atualizar a lista
  const handleObjectiveDeleted = (deletedId) => {
    console.log('Objetivo deletado, atualizando UI localmente:', deletedId);

    // ALTERAÇÃO 3: Atualizar o estado local diretamente para refletir a exclusão na UI
    setLocalObjectives(currentObjectives =>
      currentObjectives.filter(obj => obj.id !== deletedId)
    );

    // A chamada onRefresh agora é opcional, mas pode ser mantida se precisar
    // recarregar outros dados da tela.
    if (onRefresh) {
      onRefresh();
    }
  };

  // ALTERAÇÃO 4: Usar o estado local para verificar se a lista está vazia
  if (!localObjectives || localObjectives.length === 0) {
    return (
      <View style={itemStyles.emptyContainer}>
        <View style={itemStyles.emptyIconContainer}>
          <FontAwesome5 name="bullseye" size={50} color="#666" />
        </View>
        <Text style={itemStyles.emptyText}>Nenhum objetivo encontrado</Text>
        <Text style={itemStyles.emptySubtext}>
          Crie seu primeiro objetivo financeiro para começar
        </Text>
        <View style={itemStyles.tipContainer}>
          <MaterialIcons name="info-outline" size={16} color="#FFD700" />
          <Text style={itemStyles.tipText}>
            Pressione e segure um objetivo para editá-lo ou excluí-lo
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={itemStyles.container}>
      <FlatList
        // ALTERAÇÃO 5: Usar o estado local como fonte de dados para a FlatList
        data={localObjectives}
        renderItem={({ item }) => (
          <ObjectiveItem
            item={item}
            onUpdateObjective={onUpdateObjective}
            onDeleteObjective={onDeleteObjective}
            onObjectiveDeleted={handleObjectiveDeleted}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        refreshing={refreshingList}
      />

      {localObjectives.length > 2 && (
        <View style={itemStyles.listFooter}>
          <View style={itemStyles.tipContainer}>
            <MaterialIcons name="touch-app" size={16} color="#FFD700" />
            <Text style={itemStyles.tipText}>
              Pressione e segure qualquer objetivo para editar ou excluir
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};


// Estilos para os itens melhorados - ADICIONADOS NOVOS ESTILOS
const itemStyles = {
  container: {
    flex: 1,
  },
  
  listFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Loading overlay para exclusão
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Item de objetivo melhorado
  objectiveItem: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  completedObjective: {
    borderColor: 'rgba(76, 175, 80, 0.3)',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },

  urgentObjective: {
    borderColor: 'rgba(244, 67, 54, 0.3)',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },

  objectiveTouchable: {
    padding: 20,
  },

  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  statusCompleted: {
    backgroundColor: '#4CAF50',
  },

  statusOnTrack: {
    backgroundColor: '#FFD700',
  },

  statusBehind: {
    backgroundColor: '#FF9800',
  },

  statusCritical: {
    backgroundColor: '#F44336',
  },

  depthIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  objectiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },

  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },

  objectiveProgress: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  donutContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },

  donutTextOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -15 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 30,
  },

  donutText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },

  objectiveDetails: {
    marginBottom: 12,
  },

  amountContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  currentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  targetAmount: {
    fontSize: 14,
    color: '#AAAAAA',
  },

  deadlineContainer: {
    alignItems: 'center',
  },

  deadline: {
    fontSize: 13,
    fontWeight: '600',
  },

  normalDeadline: {
    color: '#AAAAAA',
  },

  urgentDeadline: {
    color: '#FF9800',
  },

  dueTodayDeadline: {
    color: '#FFD700',
  },

  overdueDeadline: {
    color: '#F44336',
  },

  deadlineDateContainer: {
    alignItems: 'center',
  },

  dateDisplayTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },

  deadlineDate: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },

  calendarIconSmall: {
    padding: 2,
  },

  longPressHint: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },

  // Ações do long press
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  actionButtonsContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -35 }],
    flexDirection: 'column',
    gap: 10,
    backgroundColor: 'rgba(42, 42, 42, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 2,
    minWidth: 120,
  },

  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 8,
  },

  deleteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
    gap: 8,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty state melhorado
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },

  emptyText: {
    fontSize: 20,
    color: '#CCCCCC',
    marginBottom: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptySubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    gap: 10,
    maxWidth: width - 64,
  },

  tipText: {
    color: '#FFD700',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  // Estilos de progresso
  progressGood: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },

  progressTextGood: {
    color: '#4CAF50',
  },

  progressMedium: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },

  progressTextMedium: {
    color: '#FFD700',
  },

  progressLow: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: 'rgba(255, 152, 0, 0.4)',
  },

  progressTextLow: {
    color: '#FF9800',
  },

  progressCritical: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },

  progressTextCritical: {
    color: '#F44336',
  },
};

// Estilos do modal melhorados
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '92%',
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#222',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  closeButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  modalContent: {
    maxHeight: '70%',
    paddingBottom: 10,
  },

  inputContainer: {
    marginHorizontal: 24,
    marginVertical: 16,
  },

  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  textInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 16,
    padding: 18,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  inputError: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },

  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },

  helperText: {
    color: '#888',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },

  previewContainer: {
    marginHorizontal: 24,
    marginVertical: 16,
  },

  previewLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },

  previewCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    padding: 24,
  },

  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  previewProgress: {
    alignItems: 'center',
  },

  previewAmount: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },

  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },

  previewPercentage: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 16,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#222',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: '#333',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  saveButton: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

export default ObjectivesList;