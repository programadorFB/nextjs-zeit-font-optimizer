import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { GoldGradient } from '../components/GoldGradient';
import RiskSlider from '../components/RiskSlider';
import { useBetting } from '../context/BettingContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [initialBank, setInitialBank] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [initialBankError, setInitialBankError] = useState('');
  const { saveCompleteProfile } = useBetting();
  const [riskValue, setRiskValue] = useState(5);


  // Animation for coin spinning effect
  const [coinSpinAnim] = useState(new Animated.Value(0));
  const { login, register, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    // Coin spinning animation - continuous rotation
    const spinAnimation = Animated.loop(
      Animated.timing(coinSpinAnim, {
        toValue: 2,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [coinSpinAnim]);

  // Coin rotation interpolation (Y-axis for coin flip effect)
  const coinRotation = coinSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    clearError();
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setInitialBankError('');
  }, [isLogin]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateInitialBank = (amount) => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    return !isNaN(numericAmount) && numericAmount > 0;
  };

  const formatCurrency = (value) => {
    // Remove tudo que não é número ou vírgula/ponto
    const cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto para cálculos
    const numericValue = parseFloat(cleanValue.replace(',', '.'));
    
    if (isNaN(numericValue)) return '';
    
    // Formatar para moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const handleInitialBankChange = (text) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanText = text.replace(/[^\d.,]/g, '');
    setInitialBank(cleanText);
    
    if (initialBankError) setInitialBankError('');
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setInitialBankError('');

    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      isValid = false;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setNameError('Nome é obrigatório');
        isValid = false;
      } else if (!validateName(name)) {
        setNameError('Nome deve ter pelo menos 2 caracteres');
        isValid = false;
      }

      // Validação da banca inicial
      if (!initialBank.trim()) {
        setInitialBankError('Banca inicial é obrigatória');
        isValid = false;
      } else if (!validateInitialBank(initialBank)) {
        setInitialBankError('Informe um valor válido maior que zero');
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  clearError();
  try {
    let result;
    if (isLogin) {
      result = await login(email.trim().toLowerCase(), password);
    } else {
      // Converte a banca inicial para número
      const bankAmount = Number(parseFloat(initialBank.replace(',', '.')).toFixed(2));
      
      result = await register(
        name.trim(), 
        email.trim().toLowerCase(), 
        password,
        bankAmount, 
        riskValue,
      );
      
      // NOVO: Após o registro bem-sucedido, salvar o perfil completo
      if (result.success) {
        try {
          // Definir o perfil baseado no riskValue
          let selectedProfile;
          if (riskValue <= 3) {
            selectedProfile = {
              id: 'cautious',
              title: 'Jogador Cauteloso',
              description: 'Prefere apostas seguras com menor risco, focando em preservar o bankroll e fazer ganhos consistentes.',
              color: '#4CAF50',
              expectedReturn: 'Ganhos Baixos/Constantes',
              icon: { name: 'shield-alt', color: '#4CAF50' },
              features: [
                'Apostas externas (vermelho/preto)',
                'Menor volatilidade',
                'Gestão rigorosa do bankroll',
                'Sessões mais longas'
              ]
            };
          } else if (riskValue <= 6) {
            selectedProfile = {
              id: 'balanced',
              title: 'Jogador Equilibrado',
              description: 'Combina apostas seguras com algumas jogadas mais arriscadas, buscando equilíbrio entre risco e recompensa.',
              color: '#FFD700',
              expectedReturn: 'Ganhos Moderados',
              icon: { name: 'balance-scale', color: '#FFD700' },
              features: [
                'Mix de apostas internas/externas',
                'Risco calculado',
                'Estratégias diversificadas',
                'Flexibilidade nas apostas'
              ]
            };
          } else {
            selectedProfile = {
              id: 'highrisk',
              title: 'Jogador de Alto Risco',
              description: 'Busca grandes ganhos através de apostas de alto risco, aceitando maior volatilidade para maximizar retornos.',
              color: '#F44336',
              expectedReturn: 'Ganhos Altos/Voláteis',
              icon: { name: 'fire', color: '#F44336' },
              features: [
                'Apostas em números específicos',
                'Alta volatilidade',
                'Potencial de grandes ganhos',
                'Sessões intensas'
              ]
            };
          }

          // Salvar o perfil completo usando o contexto
          const completeProfileData = {
            profile: selectedProfile,
            profileType: selectedProfile.id,
            riskLevel: riskValue,
            stopLoss: bankAmount * 0.1, // 10% da banca como padrão
            profitTarget: bankAmount * 0.2, // 20% da banca como padrão
            bankroll: bankAmount,
            initialBalance: bankAmount,
            createdAt: new Date().toISOString(),
            isInitialized: true
          };

          await saveCompleteProfile(completeProfileData);
          console.log('Perfil salvo no cadastro:', completeProfileData);
          
        } catch (profileError) {
          console.error('Erro ao salvar perfil durante cadastro:', profileError);
          // Não impedir o login, apenas log do erro
        }
      }
    }
    if (!result.success) {
      return;
    }
  } catch (error) {
    Alert.alert(
      'Erro Inesperado',
      'Algo deu errado. Tente novamente.',
      [{ text: 'OK' }]
    );
  }
};
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setInitialBank('');
    setShowPassword(false);
    clearError();
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setInitialBankError('');
  };

  const clearField = (field) => {
    switch (field) {
      case 'email':
        setEmail('');
        setEmailError('');
        break;
      case 'password':
        setPassword('');
        setPasswordError('');
        break;
      case 'name':
        setName('');
        setNameError('');
        break;
      case 'initialBank':
        setInitialBank('');
        setInitialBankError('');
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Enhanced background image with better fitting */}
      <ImageBackground 
        source={require('../assets/fundoLuxo.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Gradient overlay for better text readability */}
        <View style={styles.overlayGradient} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with enhanced coin animation */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.Image
                source={require('../assets/logo.png')}
                style={[
                  styles.logo,
                  {
                    transform: [
                      { rotateY: coinRotation },
                    ],
                  },
                ]}
              />
              {/* Coin shadow effect */}
              <Animated.View 
                style={[
                  styles.logoShadow,
                ]} 
              />
            </View>
            <Text style={styles.title}>Gerenciamento Premium</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </Text>
            {!isLogin && (
              <Text style={styles.registerSubtitle}>
                💰 Defina sua banca inicial para começar
              </Text>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.errorCloseButton}>
                <MaterialIcons name="close" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome Completo</Text>
                <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                  <MaterialIcons name="person" size={20} color="#FFD700" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {name.length > 0 && (
                    <TouchableOpacity onPress={() => clearField('name')} style={styles.clearButton}>
                      <MaterialIcons name="clear" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                <MaterialIcons name="email" size={20} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Digite seu email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => clearField('email')} style={styles.clearButton}>
                    <MaterialIcons name="clear" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                <MaterialIcons name="lock" size={20} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

              {!isLogin && password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${Math.min(100, (password.length / 8) * 100)}%`,
                          backgroundColor: password.length < 6 ? '#F44336' :
                            password.length < 8 ? '#FF9800' : '#4CAF50'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.strengthText}>
                    {password.length < 6 ? 'Fraca' :
                      password.length < 8 ? 'Média' : 'Forte'}
                  </Text>
                </View>
              )}
            </View>

            {/* Campo de Banca Inicial - SOMENTE NO CADASTRO */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <FontAwesome5 name="coins" size={14} color="#FFD700" /> Banca Inicial *
                </Text>
                <View style={[styles.inputWrapper, initialBankError && styles.inputError]}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.input}
                    value={initialBank}
                    onChangeText={handleInitialBankChange}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                  {initialBank.length > 0 && (
                    <TouchableOpacity onPress={() => clearField('initialBank')} style={styles.clearButton}>
                      <MaterialIcons name="clear" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {initialBankError ? <Text style={styles.fieldError}>{initialBankError}</Text> : null}
                
                {/* Preview da banca formatada */}
                {initialBank && validateInitialBank(initialBank) && (
                  <View style={styles.bankPreview}>
                    <FontAwesome5 name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.bankPreviewText}>
                      Banca inicial: R$ {formatCurrency(initialBank)}
                    </Text>
                  </View>
                )}
                {!isLogin && (
                  <>
                    <View style={{ marginTop: 20 }}>
                      <Text style={styles.label}>Perfil de Investimento</Text>
                      <RiskSlider 
                        value={riskValue}
                        onValueChange={setRiskValue}
                        selectedProfile={null}
                      />
                    </View>
                  </>
                )}

                {/* Dica sobre a banca inicial */}
                <View style={styles.bankTip}>
                  <MaterialIcons name="info" size={16} color="#FFD700" />
                  <Text style={styles.bankTipText}>
                    Esta será sua banca de referência para cálculos de performance e estatísticas
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <GoldGradient style={{ ...styles.buttonGradient, opacity: isLoading ? 0.5 : 1, }}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <View style={styles.buttonContent}>
                    <FontAwesome5 
                      name={isLogin ? "sign-in-alt" : "user-plus"} 
                      size={16} 
                      color="#000" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.buttonText}>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                    </Text>
                  </View>
                )}
              </GoldGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.toggleText}>
                {isLogin ? "Não tem uma conta? " : 'Já tem uma conta? '}
                <Text style={styles.toggleTextHighlight}>
                  {isLogin ? 'Cadastre-se' : 'Faça Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Betting Management System v1.0
            </Text>
            <Text style={styles.footerSubtext}>
              Gerencie suas apostas com inteligência
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Reduced overlay for better image visibility
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  logoShadow: {
    position: 'absolute',
    bottom: -15,
    width: 60,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 30,
    opacity: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 223, 0, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#DDDDDD',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  registerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
    fontWeight: '500',
  },
  errorCloseButton: {
    padding: 5,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 55,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 15,
  },
  clearButton: {
    padding: 5,
    marginLeft: 10,
  },
  passwordToggle: {
    padding: 5,
    marginLeft: 10,
  },
  fieldError: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: 10,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: '#DDDDDD',
    minWidth: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bankPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  bankPreviewText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bankTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bankTipText: {
    color: '#DDDDDD',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonDisabled: {
    shadowOpacity: 0.2,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 15,
  },
  toggleText: {
    color: '#DDDDDD',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toggleTextHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default LoginScreen;