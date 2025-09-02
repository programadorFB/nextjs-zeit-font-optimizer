const EditModal = ({ visible, onClose, title, value, onSave, isStopLoss = false, initialBalance = 0 }) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setInputValue(value.toString());
      setError('');
    }
  }, [visible, value]);

  const handleSave = () => {
    const numericValue = parseFloat(inputValue.replace(',', '.'));
    
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    if (isStopLoss && numericValue >= initialBalance) {
      setError('Stop Loss deve ser menor que o valor inicial da banca');
      return;
    }

    onSave(numericValue);
    onClose();
    setInputValue('');
    setError('');
  };

  const getPresetValues = () => {
    if (isStopLoss) {
      return [
        { value: initialBalance * 0.05, label: '5%' },
        { value: initialBalance * 0.10, label: '10%' },
        { value: initialBalance * 0.20, label: '20%' },
        { value: initialBalance * 0.30, label: '30%' },
      ];
    }
    return [];
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Valor em R$</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.modalInput}
                  value={inputValue}
                  onChangeText={(text) => {
                    setInputValue(text.replace(/[^0-9.,]/g, ''));
                    setError('');
                  }}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {isStopLoss && getPresetValues().length > 0 && (
              <View style={styles.presetContainer}>
                <Text style={styles.presetTitle}>Valores sugeridos:</Text>
                <View style={styles.presetButtons}>
                  {getPresetValues().map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.presetButton}
                      onPress={() => {
                        setInputValue(preset.value.toFixed(0));
                        setError('');
                      }}
                    >
                      <Text style={styles.presetButtonText}>{preset.label}</Text>
                      <Text style={styles.presetValueText}>R$ {preset.value.toFixed(0)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
