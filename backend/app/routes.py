# routes.py

from flask import Blueprint, request, jsonify
from . import db
from .models import User, Transaction, BettingProfile, Objective, BettingSession, BettingStats
from sqlalchemy import desc, func, and_, extract
from decimal import Decimal
from datetime import datetime, date, timedelta
import uuid
import hashlib
import jwt as pyjwt
import os
from functools import wraps

main = Blueprint('main', __name__)

# Helper function to generate JWT tokens
def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return pyjwt.encode(payload, os.getenv('SECRET_KEY', 'your-secret-key'), algorithm='HS256')

# Decorator to require authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = pyjwt.decode(token, os.getenv('SECRET_KEY', 'your-secret-key'), algorithms=['HS256'])
            current_user_id = data['user_id']
        except pyjwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# =================================================================
# FUNÇÃO AUXILIAR PARA CÁLCULO DE SALDO (ADICIONADA)
# =================================================================
def _get_user_balance(user_id):
    """
    Calcula o saldo atual do usuário de forma robusta, somando depósitos e subtraindo saques.
    Isso evita o erro 'TypeError' e garante que o saldo seja sempre um valor numérico.
    """
    total_deposits = db.session.query(func.sum(Transaction.amount)).filter(
        and_(Transaction.user_id == user_id, Transaction.type == 'deposit')
    ).scalar() or Decimal('0.00')

    total_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
        and_(Transaction.user_id == user_id, Transaction.type == 'withdraw')
    ).scalar() or Decimal('0.00')
    
    return total_deposits - total_withdrawals

def _get_user_initial_bank(user_id):
    """
    Obtém a banca inicial do usuário através da primeira transação marcada como inicial
    ou do perfil de apostas.
    """
    # Primeiro tenta encontrar na transação inicial
    initial_tx = Transaction.query.filter_by(
        user_id=user_id, 
        is_initial_bank=True
    ).first()
    
    if initial_tx:
        return initial_tx.amount
    
    # Senão, busca no perfil de apostas
    profile = BettingProfile.query.filter_by(
        user_id=user_id, 
        is_active=True
    ).first()
    
    if profile:
        return profile.initial_balance
    
    # Valor padrão se não encontrar
    return Decimal('0.00')

# === AUTHENTICATION ROUTES ===

@main.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    initial_bank = data.get('initialBank', 0)
    
    # VALIDAÇÃO OBRIGATÓRIA DA BANCA INICIAL
    if not all([name, email, password]):
        return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
    
    if not initial_bank or initial_bank <= 0:
        return jsonify({'error': 'Banca inicial é obrigatória e deve ser maior que zero'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email já está registrado'}), 400
    
    try:
        # Converter para Decimal para garantir precisão
        initial_bank_decimal = Decimal(str(initial_bank))
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # 1. Criar o usuário
        user = User(
            name=name,
            email=email,
            password_hash=password_hash
        )
        
        db.session.add(user)
        db.session.flush()  # Para obter o ID do usuário
        
        # 2. Criar a transação inicial da banca
        initial_transaction = Transaction(
            user_id=user.id,
            type='deposit',
            amount=initial_bank_decimal,
            category='Depósito Inicial',
            description='Banca inicial - Cadastro da conta',
            is_initial_bank=True,
            balance_before=Decimal('0.00'),
            balance_after=initial_bank_decimal,
            meta={'created_on_register': True},
            date=datetime.utcnow()
        )
        
        db.session.add(initial_transaction)
        
        # 3. Criar perfil de apostas padrão com a banca inicial
        default_betting_profile = BettingProfile(
            user_id=user.id,
            profile_type='balanced',
            title='Perfil Padrão',
            description='Perfil criado automaticamente no cadastro',
            risk_level=5,
            initial_balance=initial_bank_decimal,
            stop_loss=initial_bank_decimal * Decimal('0.5'),  # 50% da banca como stop loss padrão
            profit_target=initial_bank_decimal * Decimal('0.3'),  # 30% da banca como meta padrão
            features=['bankroll_management', 'session_tracking'],
            color='#FFD700',
            icon_name='dice',
            is_active=True
        )
        
        db.session.add(default_betting_profile)
        
        # 4. Confirmar todas as operações
        db.session.commit()
        
        # 5. Gerar token
        token = generate_token(user.id)
        
        return jsonify({
            'success': True,
            'message': 'Conta criada com sucesso! Sua banca inicial foi definida.',
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'initial_bank': str(initial_bank_decimal),
                'current_balance': str(initial_bank_decimal)
            }
        }), 201
        
    except (ValueError, TypeError) as e:
        db.session.rollback()
        return jsonify({'error': 'Valor da banca inicial inválido'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or user.password_hash != hashlib.sha256(password.encode()).hexdigest():
        return jsonify({'error': 'Credenciais inválidas'}), 401
    
    token = generate_token(user.id)
    
    # Buscar informações adicionais do usuário
    current_balance = _get_user_balance(user.id)
    initial_bank = _get_user_initial_bank(user.id)
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'initial_bank': str(initial_bank),
            'current_balance': str(current_balance)
        }
    })

# === BETTING PROFILE ROUTES ===

@main.route('/betting-profiles', methods=['POST'])
@token_required 
def create_betting_profile(current_user_id):
    data = request.json
    profile_data = data.get('profile', {})
    
    betting_profile = BettingProfile(
        user_id=current_user_id,
        profile_type=profile_data.get('id', 'balanced'),
        title=profile_data.get('title', 'Perfil Padrão'),
        description=profile_data.get('description', ''),
        risk_level=data.get('riskLevel', 0),
        initial_balance=Decimal(str(data.get('bankroll', 0))),
        stop_loss=Decimal(str(data.get('stopLoss', 0))),
        profit_target=Decimal(str(data.get('profitTarget', 0))),
        features=profile_data.get('features', []),
        color=profile_data.get('color', '#FFD700'),
        icon_name=profile_data.get('icon', {}).get('name', 'dice')
    )
    
    BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).update({'is_active': False})
    
    db.session.add(betting_profile)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {
            'id': betting_profile.id,
            'profile_type': betting_profile.profile_type,
            'title': betting_profile.title,
            'risk_level': betting_profile.risk_level,
            'initial_balance': str(betting_profile.initial_balance),
            'stop_loss': str(betting_profile.stop_loss),
            'profit_target': str(betting_profile.profit_target)
        }
    }), 201

@main.route('/betting-profiles', methods=['GET'])
@token_required
def get_betting_profile(current_user_id):
    profile = BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).first()
    
    if not profile:
        return jsonify({'error': 'No active betting profile found'}), 404
    
    return jsonify({
        'success': True,
        'data': {
            'id': profile.id,
            'profile_type': profile.profile_type,
            'title': profile.title,
            'description': profile.description,
            'risk_level': profile.risk_level,
            'initial_balance': str(profile.initial_balance),
            'stop_loss': str(profile.stop_loss),
            'profit_target': str(profile.profit_target),
            'features': profile.features,
            'color': profile.color,
            'icon_name': profile.icon_name,
            'created_at': profile.created_at.isoformat()
        }
    })

@main.route('/betting-profiles/<int:profile_id>', methods=['PUT'])
@token_required
def update_betting_profile(current_user_id, profile_id):
    data = request.json
    profile = BettingProfile.query.filter_by(id=profile_id, user_id=current_user_id).first()
    
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    if 'stopLoss' in data:
        profile.stop_loss = Decimal(str(data['stopLoss']))
    if 'profitTarget' in data:
        profile.profit_target = Decimal(str(data['profitTarget']))
    if 'riskLevel' in data:
        profile.risk_level = data['riskLevel']
    
    profile.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'success': True})

# === TRANSACTION ROUTES ===
@main.route('/transactions', methods=['GET'])
@token_required
def get_transactions(current_user_id):
    """
    Retorna todas as transações do usuário, ordenadas por data decrescente.
    """
    try:
        transactions = Transaction.query.filter_by(
            user_id=current_user_id
        ).order_by(desc(Transaction.date)).all()

        return jsonify({
            'success': True,
            'data': [
                {
                    'id': tx.id,
                    'type': tx.type,
                    'amount': str(tx.amount),
                    'category': tx.category,
                    'description': tx.description,
                    'date': tx.date.isoformat(),
                    'balance_before': str(tx.balance_before),
                    'balance_after': str(tx.balance_after),
                    'is_initial_bank': tx.is_initial_bank,
                    'meta': tx.meta or {}
                }
                for tx in transactions
            ]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar transações'
        }), 500

@main.route('/transactions', methods=['POST'])
@token_required
def create_transaction(current_user_id):
    data = request.json
    tx_type = data.get('type')
    amount = Decimal(str(data.get('amount')))
    
    # CORREÇÃO: Lógica de saldo instável substituída
    current_balance = _get_user_balance(current_user_id)

    if tx_type == 'deposit':
        new_balance = current_balance + amount
    else:
        new_balance = current_balance - amount

    new_tx = Transaction(
        user_id=current_user_id,
        type=tx_type,
        amount=amount,
        category=data.get('category'),
        description=data.get('description'),
        is_initial_bank=data.get('isInitialBank', False),
        betting_session_id=data.get('bettingSessionId'),
        game_type=data.get('gameType'),
        balance_before=current_balance,
        balance_after=new_balance,
        meta=data.get('meta', {}),
        date=datetime.utcnow()
    )

    db.session.add(new_tx)
    db.session.commit()

    return jsonify({
        'success': True,
        'data': {
            'id': new_tx.id,
            'type': new_tx.type,
            'amount': str(new_tx.amount),
            'balance_before': str(new_tx.balance_before),
            'balance_after': str(new_tx.balance_after),
            'category': new_tx.category,
            'description': new_tx.description,
            'date': new_tx.date.isoformat(),
            'meta': new_tx.meta
        }
    }), 201

@main.route('/transactions/summary', methods=['GET'])
@token_required
def get_transactions_summary(current_user_id):
    """
    Retorna um resumo das transações para dashboard.
    """
    try:
        # Contar transações por tipo
        deposit_count = Transaction.query.filter_by(
            user_id=current_user_id, 
            type='deposit'
        ).count()
        
        withdraw_count = Transaction.query.filter_by(
            user_id=current_user_id, 
            type='withdraw'
        ).count()
        
        # Última transação
        last_transaction = Transaction.query.filter_by(
            user_id=current_user_id
        ).order_by(desc(Transaction.date)).first()
        
        # Categorias mais usadas
        popular_categories = db.session.query(
            Transaction.category,
            func.count(Transaction.id).label('count')
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.category.isnot(None)
        ).group_by(Transaction.category).order_by(
            desc('count')
        ).limit(5).all()
        
        # Transações hoje
        today = datetime.utcnow().date()
        today_transactions = Transaction.query.filter(
            Transaction.user_id == current_user_id,
            func.date(Transaction.date) == today
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'total_transactions': deposit_count + withdraw_count,
                'deposit_count': deposit_count,
                'withdraw_count': withdraw_count,
                'today_transactions': today_transactions,
                'last_transaction': {
                    'id': last_transaction.id,
                    'type': last_transaction.type,
                    'amount': str(last_transaction.amount),
                    'category': last_transaction.category,
                    'date': last_transaction.date.isoformat()
                } if last_transaction else None,
                'popular_categories': [
                    {'category': cat[0], 'count': cat[1]} 
                    for cat in popular_categories
                ]
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'error': 'Erro ao carregar resumo'
        }), 500
@main.route('/transactions/<int:transaction_id>', methods=['PUT'])
@token_required
def update_transaction(current_user_id, transaction_id):
    """
    Atualiza uma transação existente.
    Permite editar: amount, category, description, type, date
    """
    try:
        # Buscar a transação
        transaction = Transaction.query.filter_by(
            id=transaction_id, 
            user_id=current_user_id
        ).first()
        
        if not transaction:
            return jsonify({
                'success': False, 
                'error': 'Transação não encontrada'
            }), 404
        
        # Não permitir editar transação inicial da banca
        if transaction.is_initial_bank:
            return jsonify({
                'success': False, 
                'error': 'Não é possível editar a transação inicial da banca'
            }), 400
        
        data = request.json
        
        # Validações básicas
        if 'amount' in data:
            try:
                new_amount = Decimal(str(data['amount']))
                if new_amount <= 0:
                    return jsonify({
                        'success': False, 
                        'error': 'Valor deve ser maior que zero'
                    }), 400
            except (ValueError, TypeError):
                return jsonify({
                    'success': False, 
                    'error': 'Valor inválido'
                }), 400
        
        if 'type' in data and data['type'] not in ['deposit', 'withdraw']:
            return jsonify({
                'success': False, 
                'error': 'Tipo deve ser "deposit" ou "withdraw"'
            }), 400
        
        if 'category' in data and not data['category'].strip():
            return jsonify({
                'success': False, 
                'error': 'Categoria é obrigatória'
            }), 400
        
        # Salvar valores originais para recalcular saldos
        old_amount = transaction.amount
        old_type = transaction.type
        
        # Atualizar campos da transação
        if 'amount' in data:
            transaction.amount = Decimal(str(data['amount']))
        
        if 'category' in data:
            transaction.category = data['category'].strip()
        
        if 'description' in data:
            transaction.description = data['description']
        
        if 'type' in data:
            transaction.type = data['type']
        
        if 'date' in data:
            try:
                # Aceitar tanto ISO string quanto datetime
                if isinstance(data['date'], str):
                    transaction.date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
                else:
                    transaction.date = data['date']
            except (ValueError, TypeError):
                return jsonify({
                    'success': False, 
                    'error': 'Formato de data inválido'
                }), 400
        
        transaction.updated_at = datetime.utcnow()
        
        # Recalcular saldos se amount ou type mudaram
        if 'amount' in data or 'type' in data:
            # Reverter o efeito da transação original
            if old_type == 'deposit':
                adjusted_balance = transaction.balance_before
            else:  # withdraw
                adjusted_balance = transaction.balance_before
            
            # Aplicar o novo efeito
            if transaction.type == 'deposit':
                transaction.balance_after = adjusted_balance + transaction.amount
            else:  # withdraw
                transaction.balance_after = adjusted_balance - transaction.amount
            
            # Atualizar saldos de transações posteriores
            later_transactions = Transaction.query.filter(
                Transaction.user_id == current_user_id,
                Transaction.date > transaction.date,
                Transaction.id != transaction.id
            ).order_by(Transaction.date).all()
            
            current_balance = transaction.balance_after
            for later_tx in later_transactions:
                later_tx.balance_before = current_balance
                if later_tx.type == 'deposit':
                    current_balance += later_tx.amount
                else:
                    current_balance -= later_tx.amount
                later_tx.balance_after = current_balance
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transação atualizada com sucesso',
            'data': {
                'id': transaction.id,
                'type': transaction.type,
                'amount': str(transaction.amount),
                'category': transaction.category,
                'description': transaction.description,
                'date': transaction.date.isoformat(),
                'balance_before': str(transaction.balance_before),
                'balance_after': str(transaction.balance_after),
                'updated_at': transaction.updated_at.isoformat()
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False, 
            'error': 'Erro interno do servidor'
        }), 500
@main.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user_id, transaction_id):
    """
    Exclui uma transação existente.
    Não permite excluir a transação inicial da banca.
    """
    try:
        # Buscar a transação
        transaction = Transaction.query.filter_by(
            id=transaction_id, 
            user_id=current_user_id
        ).first()
        
        if not transaction:
            return jsonify({
                'success': False, 
                'error': 'Transação não encontrada'
            }), 404
        
        # Não permitir excluir transação inicial da banca
        if transaction.is_initial_bank:
            return jsonify({
                'success': False, 
                'error': 'Não é possível excluir a transação inicial da banca'
            }), 400
        
        # Salvar dados para recalcular saldos
        deleted_amount = transaction.amount
        deleted_type = transaction.type
        deleted_date = transaction.date
        balance_before_deleted = transaction.balance_before
        
        # Atualizar saldos de transações posteriores
        later_transactions = Transaction.query.filter(
            Transaction.user_id == current_user_id,
            Transaction.date > deleted_date,
            Transaction.id != transaction_id
        ).order_by(Transaction.date).all()
        
        # O novo saldo após a exclusão é o balance_before da transação excluída
        current_balance = balance_before_deleted
        
        for later_tx in later_transactions:
            later_tx.balance_before = current_balance
            if later_tx.type == 'deposit':
                current_balance += later_tx.amount
            else:
                current_balance -= later_tx.amount
            later_tx.balance_after = current_balance
        
        # Excluir a transação
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transação excluída com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False, 
            'error': 'Erro interno do servidor'
        }), 500
@main.route('/balance', methods=['GET'])
@token_required
def get_balance(current_user_id):
    # CORREÇÃO: Lógica de saldo instável substituída
    current_balance = _get_user_balance(current_user_id)
    initial_bank = _get_user_initial_bank(current_user_id)
    
    return jsonify({
        'success': True,
        'balance': str(current_balance),
        'initial_bank': str(initial_bank),
        'profit_loss': str(current_balance - initial_bank)
    })

# === DASHBOARD OVERVIEW ROUTE (NOVA) ===

@main.route('/dashboard/overview', methods=['GET'])
@token_required
def get_dashboard_overview(current_user_id):
    """
    Endpoint específico para fornecer dados completos do dashboard,
    incluindo a banca inicial definida no cadastro.
    """
    try:
        # Obter dados básicos
        current_balance = _get_user_balance(current_user_id)
        initial_bank = _get_user_initial_bank(current_user_id)
        
        # Calcular métricas
        profit_loss = current_balance - initial_bank
        roi_percentage = ((current_balance - initial_bank) / initial_bank * 100) if initial_bank > 0 else 0
        
        # Obter perfil ativo
        profile = BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).first()
        
        # Estatísticas de transações
        total_deposits = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'deposit'
        ).scalar() or Decimal('0.00')
        
        total_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'withdraw'
        ).scalar() or Decimal('0.00')
        
        # Contar transações
        total_transactions = Transaction.query.filter_by(user_id=current_user_id).count()
        
        # Última transação
        last_transaction = Transaction.query.filter_by(
            user_id=current_user_id
        ).order_by(desc(Transaction.date)).first()
        
        return jsonify({
            'success': True,
            'data': {
                # Dados financeiros principais
                'current_balance': str(current_balance),
                'initial_bank': str(initial_bank),
                'profit_loss': str(profit_loss),
                'roi_percentage': round(float(roi_percentage), 2),
                
                # Estatísticas de transações
                'total_deposits': str(total_deposits),
                'total_withdrawals': str(total_withdrawals),
                'total_transactions': total_transactions,
                
                # Dados do perfil
                'profile': {
                    'risk_level': profile.risk_level if profile else 5,
                    'stop_loss': str(profile.stop_loss) if profile else '0.00',
                    'profit_target': str(profile.profit_target) if profile else '0.00',
                    'title': profile.title if profile else 'Perfil Padrão'
                } if profile else None,
                
                # Última atividade
                'last_transaction': {
                    'type': last_transaction.type,
                    'amount': str(last_transaction.amount),
                    'category': last_transaction.category,
                    'date': last_transaction.date.isoformat()
                } if last_transaction else None,
                
                # Status da conta
                'account_status': {
                    'is_profitable': profit_loss > 0,
                    'days_since_creation': (datetime.utcnow() - profile.created_at).days if profile else 0,
                    'has_initial_bank': initial_bank > 0
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Erro ao carregar dados do dashboard'
        }), 500

# === OBJECTIVES ROUTES ===

@main.route('/objectives', methods=['POST'])
@token_required
def create_objective(current_user_id):
    data = request.json
    
    objective = Objective(
        user_id=current_user_id,
        title=data.get('title'),
        description=data.get('description'),
        target_amount=Decimal(str(data.get('target_amount'))),
        current_amount=Decimal(str(data.get('current_amount'))),
        target_date=datetime.strptime(data.get('target_date'), '%Y-%m-%d').date() if data.get('target_date') else None,
        priority=data.get('priority', 'medium'),
        category=data.get('category'),
        color=data.get('color', '#FFD700'),
        icon_name=data.get('icon_name', 'flag'),
        meta=data.get('meta', {})
    )
    
    db.session.add(objective)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {
            'id': objective.id,
            'title': objective.title,
            'target_amount': str(objective.target_amount),
            'current_amount': str(objective.current_amount),
            'status': objective.status
        }
    }), 201

@main.route('/objectives', methods=['GET'])
@token_required
def get_objectives(current_user_id):
    objectives = Objective.query.filter_by(user_id=current_user_id).all()
    
    return jsonify({
        'success': True,
        'data': [{
            'id': obj.id,
            'title': obj.title,
            'description': obj.description,
            'target_amount': str(obj.target_amount),
            'current_amount': str(obj.current_amount),
            'target_date': obj.target_date.isoformat() if obj.target_date else None,
            'priority': obj.priority,
            'status': obj.status,
            'category': obj.category,
            'color': obj.color,
            'icon_name': obj.icon_name,
            'created_at': obj.created_at.isoformat()
        } for obj in objectives]
    })
@main.route('/objectives/<int:objective_id>', methods=['PUT'])
@token_required
def update_objective(current_user_id, objective_id):
    objective = Objective.query.filter_by(id=objective_id, user_id=current_user_id).first()

    if not objective:
        return jsonify({'error': 'Objective not found or user not authorized'}), 404

    data = request.json
    
    if 'title' in data:
        objective.title = data['title'].strip()
    if 'target_amount' in data:
        objective.target_amount = Decimal(str(data['target_amount']))
    if 'current_amount' in data:
        objective.current_amount = Decimal(str(data['current_amount']))
    if 'target_date' in data and data.get('target_date'):
        objective.target_date = datetime.strptime(data['target_date'], '%Y-%m-%d').date()
    
    objective.priority = data.get('priority', objective.priority)
    objective.category = data.get('category', objective.category)
    objective.updated_at = datetime.utcnow()

    if objective.current_amount >= objective.target_amount:
        objective.status = 'completed'
    else:
        objective.status = 'in_progress'

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Objective updated successfully!',
        'data': {
            'id': objective.id,
            'title': objective.title,
            'target_amount': str(objective.target_amount),
            'current_amount': str(objective.current_amount),
            'status': objective.status,
            'target_date': objective.target_date.isoformat() if objective.target_date else None,
        }
    })

@main.route('/objectives/<int:objective_id>', methods=['DELETE'])
@token_required
def delete_objective(current_user_id, objective_id):
    objective = Objective.query.filter_by(id=objective_id, user_id=current_user_id).first()

    if not objective:
        return jsonify({'error': 'Objective not found or user not authorized'}), 404

    db.session.delete(objective)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Objective deleted successfully'})

# === ANALYTICS ROUTES ===

@main.route('/analytics/overview', methods=['GET'])
@token_required
def get_analytics_overview(current_user_id):
    # CORREÇÃO: Lógica de saldo instável substituída + inclusão da banca inicial
    current_balance = _get_user_balance(current_user_id)
    initial_bank = _get_user_initial_bank(current_user_id)
    
    profile = BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).first()
    
    total_deposits = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user_id,
        Transaction.type == 'deposit'
    ).scalar() or Decimal('0.00')
    
    total_withdrawals = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user_id,
        Transaction.type == 'withdraw'
    ).scalar() or Decimal('0.00')
    
    # Usar a banca inicial real do usuário
    real_profit = current_balance - initial_bank
    roi = ((current_balance - initial_bank) / initial_bank * 100) if initial_bank > 0 else 0
    
    return jsonify({
        'success': True,
        'data': {
            'current_balance': str(current_balance),
            'initial_balance': str(initial_bank),  # Agora usa a banca real do cadastro
            'total_deposits': str(total_deposits),
            'total_withdrawals': str(total_withdrawals),
            'real_profit': str(real_profit),
            'roi_percentage': round(float(roi), 2),
            'stop_loss': str(profile.stop_loss) if profile else '0.00',
            'profit_target': str(profile.profit_target) if profile else '0.00',
            'risk_level': profile.risk_level if profile else 5
        }
    })

@main.route('/analytics/monthly', methods=['GET'])
@token_required
def get_monthly_analytics(current_user_id):
    months = request.args.get('months', 6, type=int)
    
    start_date = datetime.utcnow() - timedelta(days=months * 30)
    
    monthly_data = db.session.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        Transaction.type,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.date >= start_date
    ).group_by(
        extract('year', Transaction.date),
        extract('month', Transaction.date),
        Transaction.type
    ).all()
    
    result = {}
    for year, month, tx_type, total in monthly_data:
        key = f"{int(year)}-{int(month):02d}"
        if key not in result:
            result[key] = {'deposits': 0, 'withdraws': 0, 'month': key}
        
        if tx_type == 'deposit':
            result[key]['deposits'] = float(total)
        else:
            result[key]['withdraws'] = float(total)
    
    for data in result.values():
        data['balance'] = data['deposits'] - data['withdraws']
    
    return jsonify({
        'success': True,
        'data': list(result.values())
    })

# === BETTING SESSION ROUTES ===

@main.route('/betting-sessions', methods=['POST'])
@token_required
def start_betting_session(current_user_id):
    data = request.json
    
    # CORREÇÃO: Lógica de saldo instável substituída
    current_balance = _get_user_balance(current_user_id)
    
    session = BettingSession(
        user_id=current_user_id,
        session_id=str(uuid.uuid4()),
        game_type=data.get('game_type', 'roulette'),
        start_balance=current_balance,
        risk_level=data.get('risk_level', 5),
        meta=data.get('meta', {})
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'session_id': session.session_id,
        'start_balance': str(session.start_balance)
    }), 201

@main.route('/betting-sessions/<session_id>/end', methods=['POST'])
@token_required
def end_betting_session(current_user_id, session_id):
    session = BettingSession.query.filter_by(
        user_id=current_user_id,
        session_id=session_id,
        status='active'
    ).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    # CORREÇÃO: Lógica de saldo instável substituída
    current_balance = _get_user_balance(current_user_id)
    
    session.end_balance = current_balance
    session.ended_at = datetime.utcnow()
    session.duration_seconds = int((session.ended_at - session.started_at).total_seconds())
    session.net_result = current_balance - session.start_balance
    session.status = 'completed'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': {
            'session_id': session.session_id,
            'start_balance': str(session.start_balance),
            'end_balance': str(session.end_balance),
            'net_result': str(session.net_result),
            'duration_seconds': session.duration_seconds
        }
    })

# === STATISTICS ROUTES ===

@main.route('/stats/performance', methods=['GET'])
@token_required
def get_performance_stats(current_user_id):
    period = request.args.get('period', 'monthly')
    
    now = datetime.utcnow()
    if period == 'daily':
        start_date = now - timedelta(days=30)
    elif period == 'weekly':
        start_date = now - timedelta(weeks=12)
    elif period == 'monthly':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=365 * 3)
    
    profile = BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).first()
    
    stats = db.session.query(
        func.count(BettingSession.id).label('total_sessions'),
        func.sum(BettingSession.net_result).label('total_profit'),
        func.avg(BettingSession.net_result).label('avg_session_result'),
        func.max(BettingSession.net_result).label('best_session'),
        func.min(BettingSession.net_result).label('worst_session')
    ).filter(
        BettingSession.user_id == current_user_id,
        BettingSession.started_at >= start_date,
        BettingSession.status == 'completed'
    ).first()
    
    winning_sessions = db.session.query(func.count(BettingSession.id)).filter(
        BettingSession.user_id == current_user_id,
        BettingSession.started_at >= start_date,
        BettingSession.net_result > 0,
        BettingSession.status == 'completed'
    ).scalar() or 0
    
    total_sessions = stats.total_sessions or 0
    win_rate = (winning_sessions / total_sessions * 100) if total_sessions > 0 else 0
    
    initial_bank = _get_user_initial_bank(current_user_id)
    
    return jsonify({
        'success': True,
        'data': {
            'period': period,
            'total_sessions': total_sessions,
            'winning_sessions': winning_sessions,
            'win_rate': round(win_rate, 2),
            'total_profit': str(stats.total_profit or Decimal('0.00')),
            'avg_session_result': str(stats.avg_session_result or Decimal('0.00')),
            'best_session': str(stats.best_session or Decimal('0.00')),
            'worst_session': str(stats.worst_session or Decimal('0.00')),
            'initial_balance': str(initial_bank),  # Agora usa a banca real do cadastro
            'current_stop_loss': str(profile.stop_loss) if profile else '0.00',
            'current_profit_target': str(profile.profit_target) if profile else '0.00'
        }
    })

@main.route('/stats/risk-analysis', methods=['GET'])
@token_required
def get_risk_analysis(current_user_id):
    profile = BettingProfile.query.filter_by(user_id=current_user_id, is_active=True).first()
    
    current_balance = _get_user_balance(current_user_id)
    initial_bank = _get_user_initial_bank(current_user_id)  # Usar banca real do cadastro
    
    if not profile:
        return jsonify({'error': 'No betting profile found'}), 404
    
    stop_loss = profile.stop_loss
    profit_target = profile.profit_target
    
    stop_loss_distance = current_balance - stop_loss if stop_loss > 0 else None
    stop_loss_percentage = ((current_balance - stop_loss) / initial_bank * 100) if stop_loss > 0 and initial_bank > 0 else None
    
    target_balance = initial_bank + profit_target
    profit_target_distance = target_balance - current_balance if profit_target > 0 else None
    profit_target_percentage = (current_balance / target_balance * 100) if profit_target > 0 and target_balance > 0 else None
    
    risk_status = 'safe'
    if stop_loss > 0 and current_balance <= stop_loss:
        risk_status = 'stop_loss_hit'
    elif stop_loss > 0 and stop_loss_distance and stop_loss_distance < (initial_bank * 0.1):
        risk_status = 'high_risk'
    elif profit_target > 0 and current_balance >= target_balance:
        risk_status = 'target_achieved'
    
    max_balance = db.session.query(func.max(Transaction.balance_after)).filter(
        Transaction.user_id == current_user_id
    ).scalar() or initial_bank
    
    current_drawdown = max_balance - current_balance
    drawdown_percentage = (current_drawdown / max_balance * 100) if max_balance > 0 else 0
    
    return jsonify({
        'success': True,
        'data': {
            'current_balance': str(current_balance),
            'initial_balance': str(initial_bank),  # Agora usa a banca real do cadastro
            'risk_level': profile.risk_level,
            'risk_status': risk_status,
            'stop_loss': {
                'value': str(stop_loss),
                'distance': str(stop_loss_distance) if stop_loss_distance else None,
                'percentage': round(stop_loss_percentage, 2) if stop_loss_percentage else None,
                'is_active': stop_loss > 0
            },
            'profit_target': {
                'value': str(target_balance),
                'distance': str(profit_target_distance) if profit_target_distance else None,
                'percentage': round(profit_target_percentage, 2) if profit_target_percentage else None,
                'is_active': profit_target > 0
            },
            'drawdown': {
                'current': str(current_drawdown),
                'percentage': round(drawdown_percentage, 2),
                'max_balance': str(max_balance)
            }
        }
    })

# === ERROR HANDLERS ===

@main.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400

@main.errorhandler(401)
def unauthorized(error):
    return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401

@main.errorhandler(403)
def forbidden(error):
    return jsonify({'error': 'Forbidden', 'message': 'Insufficient permissions'}), 403

@main.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': 'Resource not found'}), 404

@main.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error', 'message': 'Something went wrong'}), 500

# === UTILITY ROUTES ===

@main.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@main.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user_id):
    categories = db.session.query(Transaction.category).filter(
        Transaction.user_id == current_user_id,
        Transaction.category.isnot(None)
    ).distinct().all()
    
    return jsonify({
        'success': True,
        'data': [cat[0] for cat in categories if cat[0]]
    })

@main.route('/game-types', methods=['GET'])
def get_game_types():
    game_types = [
        {'id': 'roulette', 'name': 'Roleta', 'icon': 'casino'},
        {'id': 'blackjack', 'name': 'Blackjack', 'icon': 'spade'},
        {'id': 'poker', 'name': 'Poker', 'icon': 'diamond'},
        {'id': 'slots', 'name': 'Caça-níqueis', 'icon': 'slot-machine'},
        {'id': 'baccarat', 'name': 'Baccarat', 'icon': 'cards'},
        {'id': 'sports', 'name': 'Apostas Esportivas', 'icon': 'sports-soccer'},
        {'id': 'other', 'name': 'Outros', 'icon': 'casino-chip'}
    ]
    
    return jsonify({
        'success': True,
        'data': game_types
    })