import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFinancial } from '../context/FinancialContext';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Modal para editar transação - COMPLETAMENTE EDITÁVEL
const EditTransactionModal = ({ visible, transaction, onClose, onSave }) => {
  const [editedTransaction, setEditedTransaction] = useState(transaction || {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (transaction) {
      setEditedTransaction({
        ...transaction,
        date: transaction.date ? new Date(transaction.date) : new Date(),
      });
      setErrors({});
    }
  }, [transaction]);

  const validateFields = () => {
    const newErrors = {};

    if (!editedTransaction.category?.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!editedTransaction.amount || editedTransaction.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!editedTransaction.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    if (!editedTransaction.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) {
      Alert.alert('Erro', 'Por favor, corrija os erros antes de salvar.');
      return;
    }

    // Preparar dados para envio
    const dataToSave = {
      ...editedTransaction,
      date: editedTransaction.date.toISOString(),
      amount: parseFloat(editedTransaction.amount),
      category: editedTransaction.category.trim(),
      description: editedTransaction.description?.trim() || '',
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

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTimeForDisplay = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = editedTransaction.date || new Date();
      const newDate = new Date(selectedDate);
      newDate.setHours(currentDate.getHours());
      newDate.setMinutes(currentDate.getMinutes());
      
      setEditedTransaction(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = editedTransaction.date || new Date();
      const newDate = new Date(currentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      
      setEditedTransaction(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleAmountChange = (text) => {
    // Remove tudo que não é número, vírgula ou ponto
    const cleaned = text.replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto para conversão
    const normalized = cleaned.replace(',', '.');
    
    // Permitir apenas um ponto decimal
    const parts = normalized.split('.');
    if (parts.length > 2) {
      return;
    }
    
    const numericValue = parseFloat(normalized) || 0;
    setEditedTransaction(prev => ({ ...prev, amount: numericValue }));
  };

  const predefinedCategories = [
    'Alimentação',
    'Transporte',
    'Entretenimento',
    'Saúde',
    'Educação',
    'Compras',
    'Contas',
    'Investimento',
    'Emergência',
    'Outros'
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Transação</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Categoria */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Categoria *</Text>
              <TextInput
                style={[styles.textInput, errors.category && styles.inputError]}
                value={editedTransaction.category || ''}
                onChangeText={(text) => {
                  setEditedTransaction(prev => ({ ...prev, category: text }));
                  if (errors.category) {
                    setErrors(prev => ({ ...prev, category: null }));
                  }
                }}
                placeholder="Digite ou selecione uma categoria"
                placeholderTextColor="#666"
              />
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
              
              {/* Categorias predefinidas */}
              <View style={styles.categoriesGrid}>
                {predefinedCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      editedTransaction.category === category && styles.categoryChipSelected
                    ]}
                    onPress={() => setEditedTransaction(prev => ({ ...prev, category }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      editedTransaction.category === category && styles.categoryChipTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Valor */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Valor (R$) *</Text>
              <TextInput
                style={[styles.textInput, errors.amount && styles.inputError]}
                value={editedTransaction.amount?.toString() || ''}
                onChangeText={handleAmountChange}
                placeholder="0,00"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Tipo */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tipo *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    editedTransaction.type === 'deposit' && styles.typeButtonActiveDeposit
                  ]}
                  onPress={() => {
                    setEditedTransaction(prev => ({ ...prev, type: 'deposit' }));
                    if (errors.type) {
                      setErrors(prev => ({ ...prev, type: null }));
                    }
                  }}
                >
                  <FontAwesome5 name="plus-circle" size={16} color={editedTransaction.type === 'deposit' ? '#FFFFFF' : '#4CAF50'} />
                  <Text style={[
                    styles.typeButtonText,
                    editedTransaction.type === 'deposit' && styles.typeButtonTextActiveDeposit
                  ]}>Depósito</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    editedTransaction.type === 'withdraw' && styles.typeButtonActiveWithdraw
                  ]}
                  onPress={() => {
                    setEditedTransaction(prev => ({ ...prev, type: 'withdraw' }));
                    if (errors.type) {
                      setErrors(prev => ({ ...prev, type: null }));
                    }
                  }}
                >
                  <FontAwesome5 name="minus-circle" size={16} color={editedTransaction.type === 'withdraw' ? '#FFFFFF' : '#F44336'} />
                  <Text style={[
                    styles.typeButtonText,
                    editedTransaction.type === 'withdraw' && styles.typeButtonTextActiveWithdraw
                  ]}>Saque</Text>
                </TouchableOpacity>
              </View>
              {errors.type && (
                <Text style={styles.errorText}>{errors.type}</Text>
              )}
            </View>

            {/* Data e Hora */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data e Hora *</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { flex: 2 }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialIcons name="event" size={20} color="#FFD700" />
                  <Text style={styles.dateTimeText}>
                    {formatDateForDisplay(editedTransaction.date)}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dateTimeButton, { flex: 1 }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <MaterialIcons name="access-time" size={20} color="#FFD700" />
                  <Text style={styles.dateTimeText}>
                    {formatTimeForDisplay(editedTransaction.date)}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
            </View>

            {/* Descrição */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descrição (Opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={editedTransaction.description || ''}
                onChangeText={(text) => setEditedTransaction(prev => ({ ...prev, description: text }))}
                placeholder="Adicione uma descrição para esta transação..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Prévia */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Prévia da Transação:</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <FontAwesome5 
                    name={editedTransaction.type === 'deposit' ? 'plus-circle' : 'minus-circle'} 
                    size={16} 
                    color={editedTransaction.type === 'deposit' ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={styles.previewCategory}>
                    {editedTransaction.category || 'Categoria não definida'}
                  </Text>
                </View>
                <Text style={[
                  styles.previewAmount,
                  { color: editedTransaction.type === 'deposit' ? '#4CAF50' : '#F44336' }
                ]}>
                  {editedTransaction.type === 'deposit' ? '+' : '-'} {formatCurrency(editedTransaction.amount || 0)}
                </Text>
                <Text style={styles.previewDate}>
                  {formatDateForDisplay(editedTransaction.date)} às {formatTimeForDisplay(editedTransaction.date)}
                </Text>
                {editedTransaction.description && (
                  <Text style={styles.previewDescription}>
                    {editedTransaction.description}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={editedTransaction.date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={editedTransaction.date || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Componente para renderizar cada item da lista com opções de edição/exclusão
const TransactionItem = React.memo(({ item, onEdit, onDelete }) => {
  const isDeposit = item.type === 'deposit';
  const [showActions, setShowActions] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateStr).toLocaleDateString('pt-BR', options);
  };

  const handleLongPress = () => {
    console.log('Long press detected for transaction:', item.id);
    setShowActions(true);
  };

  const handleEdit = () => {
    console.log('Edit button pressed for transaction:', item.id);
    setShowActions(false);
    onEdit(item);
  };

  const handleDelete = () => {
    console.log('Delete button pressed for transaction:', item.id);
    setShowActions(false);
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) }
      ]
    );
  };

  // Função alternativa para editar com toque simples no ícone de edição
  const handleQuickEdit = () => {
    console.log('Quick edit pressed for transaction:', item.id);
    onEdit(item);
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={styles.itemTouchable}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDeposit ? '#4CAF5020' : '#F4433620' }]}>
          <FontAwesome5 
            name={isDeposit ? 'plus-circle' : 'minus-circle'} 
            size={20} 
            color={isDeposit ? '#4CAF50' : '#F44336'} 
          />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.itemCategory} numberOfLines={1}>
            {item.category || 'Não categorizado'}
          </Text>
          <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
          {item.description && (
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        
        <View style={styles.amountAndActions}>
          <Text style={[styles.itemAmount, { color: isDeposit ? '#4CAF50' : '#F44336' }]}>
            {isDeposit ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Botões de ação sempre visíveis no canto direito */}
      <View style={styles.permanentActions}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleQuickEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="edit" size={18} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="delete" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
      
      {/* Ações temporárias que aparecem com long press */}
      {showActions && (
        <>
          <View style={styles.temporaryActions}>
            <TouchableOpacity style={styles.tempEditButton} onPress={handleEdit}>
              <MaterialIcons name="edit" size={16} color="#FFD700" />
              <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tempDeleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete" size={16} color="#F44336" />
              <Text style={styles.actionText}>Excluir</Text>
            </TouchableOpacity>
          </View>
          
          {/* Overlay para fechar ações */}
          <TouchableOpacity 
            style={styles.actionOverlay}
            onPress={() => setShowActions(false)}
            activeOpacity={1}
          />
        </>
      )}
    </View>
  );
});

// Componente da tela principal
const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { transactions, loading, refreshData, updateTransaction, deleteTransaction } = useFinancial();
  const [filter, setFilter] = useState('all'); // 'all', 'deposit', 'withdraw'
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const onRefresh = useCallback(async () => {
    await refreshData(true);
  }, [refreshData]);

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setEditModalVisible(true);
  };

  const handleSaveTransaction = async (editedTransaction) => {
    try {
      const result = await updateTransaction(editedTransaction.id, editedTransaction);
      if (result.success) {
        Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
        setSelectedTransaction(null);
        // Recarregar dados para garantir consistência
        await refreshData();
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível atualizar a transação.');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a transação.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const result = await deleteTransaction(transactionId);
      if (result.success) {
        Alert.alert('Sucesso', 'Transação excluída com sucesso!');
        // Recarregar dados para garantir consistência
        await refreshData();
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível excluir a transação.');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Erro', 'Não foi possível excluir a transação.');
    }
  };

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter === 'all') {
      return sorted;
    }
    return sorted.filter(tx => tx.type === filter);
  }, [transactions, filter]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="receipt" size={50} color="#444" />
      <Text style={styles.emptyText}>Nenhuma Transação Encontrada</Text>
      <Text style={styles.emptySubtext}>
        {filter === 'all' 
          ? 'Quando você fizer uma transação, ela aparecerá aqui.'
          : `Nenhuma transação do tipo "${filter === 'deposit' ? 'depósito' : 'saque'}" encontrada.`
        }
      </Text>
      <Text style={styles.tipText}>
        💡 Dica: Pressione e segure uma transação para editá-la ou excluí-la
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Transações</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert(
            'Como Editar Transações',
            'Para editar uma transação:\n\n1. Pressione e segure sobre a transação\n2. Toque no ícone de edição (✏️)\n3. Modifique os campos desejados\n4. Salve as alterações\n\nTodos os campos são editáveis: categoria, valor, tipo, data, hora e descrição.'
          )}
        >
          <MaterialIcons name="info-outline" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Botões de Filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas ({transactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'deposit' && styles.filterButtonActive]}
          onPress={() => setFilter('deposit')}
        >
          <Text style={[styles.filterText, filter === 'deposit' && styles.filterTextActive]}>
            Depósitos ({transactions.filter(tx => tx.type === 'deposit').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'withdraw' && styles.filterButtonActive]}
          onPress={() => setFilter('withdraw')}
        >
          <Text style={[styles.filterText, filter === 'withdraw' && styles.filterTextActive]}>
            Saques ({transactions.filter(tx => tx.type === 'withdraw').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Transações */}
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Carregando transações...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={({ item }) => (
            <TransactionItem 
              item={item}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={['#FFD700']}
              tintColor="#FFD700"
              title="Atualizando..."
              titleColor="#FFD700"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Edição */}
      <EditTransactionModal
        visible={editModalVisible}
        transaction={selectedTransaction}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: { padding: 5 },
  infoButton: { padding: 5 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#1A1A1A',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#333',
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#FFD700' },
  filterText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: '#000000' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 10,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#333',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailsContainer: { flex: 1 },
  itemCategory: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  itemDate: { color: '#888', fontSize: 12, marginTop: 4 },
  itemDescription: { color: '#AAA', fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  amountAndActions: {
    alignItems: 'flex-end',
  },
  itemAmount: { fontSize: 16, fontWeight: 'bold' },
  permanentActions: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -20 }],
    flexDirection: 'column',
    gap: 5,
  },
  temporaryActions: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -25 }],
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#2A2A2A',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#FFD70015',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD70050',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#F4433615',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F4433650',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  tempDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4433620',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  actionOverlay: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  tipText: {
    color: '#FFD700',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '95%',
    maxWidth: 450,
    maxHeight: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: '70%',
  },
  inputContainer: {
    margin: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textInputMultiline: {
    minHeight: 80,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  categoryChipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    gap: 8,
  },
  typeButtonActiveDeposit: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonActiveWithdraw: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  typeButtonTextActiveDeposit: {
    color: '#FFFFFF',
  },
  typeButtonTextActiveWithdraw: {
    color: '#FFFFFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  previewContainer: {
    margin: 15,
    marginTop: 5,
  },
  previewLabel: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    padding: 15,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  previewCategory: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDate: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  previewDescription: {
    color: '#AAA',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default TransactionHistoryScreen;