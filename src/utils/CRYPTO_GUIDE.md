# 🔐 Crypto Utilities - Guia Completo

Documentação completa das funções de criptografia e segurança da SYNTHX.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Activation Keys](#activation-keys)
3. [Password Hashing](#password-hashing)
4. [Token Generation](#token-generation)
5. [Sanitization](#sanitization)
6. [Migração do Original](#migração-do-original)
7. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

### Comparação: Original vs Novo

| Função Original | Nova Função | Status | Observações |
|----------------|-------------|--------|-------------|
| `generateActivationKey()` | ✅ `generateActivationKey()` | Melhorado | Formato XXXX-XXXX-XXXX-XXXX |
| `hashPassword(senha)` | ✅ `hashPassword(password)` | Adaptado | Web Crypto API em vez de bcrypt |
| `verifyPassword(senha, hash)` | ✅ `verifyPassword(password, hash)` | Adaptado | Supabase gerencia automaticamente |
| - | ✅ `validateActivationKey()` | **NOVO** | Valida formato |
| - | ✅ `formatActivationKey()` | **NOVO** | Formata chaves |
| - | ✅ `validatePasswordStrength()` | **NOVO** | Score 0-4 |
| - | ✅ `generateSecurePassword()` | **NOVO** | Gera senha segura |
| - | ✅ `generateSecureToken()` | **NOVO** | Tokens criptograficamente seguros |
| - | ✅ `generateUUID()` | **NOVO** | UUID v4 |
| - | ✅ `sanitizeInput()` | **NOVO** | Previne XSS |

---

## 🎮 Activation Keys

### `generateActivationKey()`

Gera uma chave de ativação única no formato `XXXX-XXXX-XXXX-XXXX`.

```typescript
import { generateActivationKey } from '../utils/crypto';

const key = generateActivationKey();
// Exemplo: "A7B9-C3D2-E8F1-G4H6"
```

**Características:**
- ✅ 16 caracteres alfanuméricos (A-Z, 0-9)
- ✅ Formato: 4 segmentos de 4 caracteres
- ✅ Separados por hífen (-)
- ✅ Maiúsculas automáticas
- ✅ ~1.8 × 10^24 combinações possíveis

**Quando usar:**
- Geração de chaves para jogos comprados
- Códigos de ativação únicos
- Tokens de resgate

---

### `generateMultipleActivationKeys(count)`

Gera múltiplas chaves únicas de uma vez.

```typescript
import { generateMultipleActivationKeys } from '../utils/crypto';

const keys = generateMultipleActivationKeys(5);
// [
//   "A7B9-C3D2-E8F1-G4H6",
//   "X9Y2-Z1A3-B4C5-D6E7",
//   "F8G9-H0I1-J2K3-L4M5",
//   "N6O7-P8Q9-R0S1-T2U3",
//   "V4W5-X6Y7-Z8A9-B0C1"
// ]
```

**Características:**
- ✅ Garante unicidade (usa Set internamente)
- ✅ Eficiente para grandes quantidades
- ✅ Útil para gerar lotes de chaves

**Quando usar:**
- Compra com múltiplos jogos
- Geração de lotes de chaves para admin
- Preparar chaves para promoções

---

### `validateActivationKey(key)`

Valida se uma chave tem formato válido.

```typescript
import { validateActivationKey } from '../utils/crypto';

validateActivationKey("A7B9-C3D2-E8F1-G4H6"); // true ✅
validateActivationKey("invalid-key"); // false ❌
validateActivationKey("a7b9-c3d2-e8f1-g4h6"); // false ❌ (minúsculas)
validateActivationKey("A7B9C3D2E8F1G4H6"); // false ❌ (sem hífens)
```

**Regras de validação:**
- ✅ Exatamente 19 caracteres (incluindo hífens)
- ✅ 4 segmentos de 4 caracteres
- ✅ Apenas A-Z e 0-9
- ✅ Maiúsculas obrigatórias

**Quando usar:**
- Validar input do usuário
- Verificar chaves antes de ativar
- Prevenir erros de digitação

---

### `formatActivationKey(key)`

Formata uma chave removendo caracteres inválidos.

```typescript
import { formatActivationKey } from '../utils/crypto';

formatActivationKey("a7b9c3d2e8f1g4h6");
// Retorna: "A7B9-C3D2-E8F1-G4H6" ✅

formatActivationKey("A7B9 C3D2 E8F1 G4H6");
// Retorna: "A7B9-C3D2-E8F1-G4H6" ✅

formatActivationKey("invalid");
// Retorna: null ❌ (não tem 16 caracteres)
```

**Características:**
- ✅ Remove espaços, hífens e caracteres especiais
- ✅ Converte para maiúsculas
- ✅ Adiciona hífens no formato correto
- ✅ Retorna null se inválida

**Quando usar:**
- Input de usuário (copy-paste)
- Normalizar chaves de diferentes fontes
- Limpar dados importados

---

## 🔒 Password Hashing

### ⚠️ IMPORTANTE: Supabase Auth

No novo sistema, **Supabase Auth gerencia hashing de senhas automaticamente**. Você **NÃO** precisa usar `hashPassword()` ou `verifyPassword()` manualmente.

```typescript
// ❌ NÃO FAÇA ISSO (desnecessário)
const hash = await hashPassword(password);
await saveToDatabase({ email, password: hash });

// ✅ FAÇA ISSO (Supabase gerencia)
await supabase.auth.signUp({ email, password });
```

---

### `hashPassword(password)` 

**Uso especial apenas.** Supabase gerencia automaticamente.

```typescript
import { hashPassword } from '../utils/crypto';

const hash = await hashPassword("senha123");
// Retorna: "base64-encoded-hash-with-salt"
```

**Detalhes técnicos:**
- Algoritmo: PBKDF2
- Hash: SHA-256
- Iterações: 100,000
- Salt: 16 bytes aleatórios
- Output: Base64 (salt + hash combinados)

**Quando usar:**
- APIs de terceiros que não gerenciam senhas
- Sistemas legados
- Casos especiais fora do Supabase

---

### `verifyPassword(password, hash)`

**Uso especial apenas.** Supabase gerencia automaticamente.

```typescript
import { verifyPassword } from '../utils/crypto';

const isValid = await verifyPassword("senha123", hash);
if (isValid) {
  console.log("Senha correta! ✅");
} else {
  console.log("Senha incorreta! ❌");
}
```

**Quando usar:**
- Verificar senhas armazenadas com `hashPassword()`
- Sistemas legados
- APIs de terceiros

---

### `validatePasswordStrength(password)`

Valida força da senha e retorna feedback.

```typescript
import { validatePasswordStrength } from '../utils/crypto';

const result = validatePasswordStrength("Senha123!");
console.log(result);
// {
//   score: 4,
//   feedback: [],
//   isStrong: true
// }

const weak = validatePasswordStrength("123");
console.log(weak);
// {
//   score: 0,
//   feedback: [
//     "Use pelo menos 12 caracteres para maior segurança",
//     "Adicione letras minúsculas",
//     "Adicione letras maiúsculas",
//     "Adicione caracteres especiais (!@#$%^&*)"
//   ],
//   isStrong: false
// }
```

**Score:**
- `0` - Muito fraca ❌
- `1` - Fraca ⚠️
- `2` - Média 📊
- `3` - Forte ✅
- `4` - Muito forte ✅✅

**Critérios avaliados:**
1. Comprimento (8+ caracteres = +1, 12+ = +2)
2. Letras minúsculas (+1)
3. Letras maiúsculas (+1)
4. Números (+1)
5. Caracteres especiais (+1)
6. Penalidade para padrões comuns (-1)

**Quando usar:**
- Validação em tempo real no formulário de signup
- Feedback visual para o usuário
- Requisitos mínimos de senha

---

### `generateSecurePassword(length, options)`

Gera senha aleatória segura.

```typescript
import { generateSecurePassword } from '../utils/crypto';

// Padrão: 16 caracteres, todos os tipos
const password1 = generateSecurePassword();
// Exemplo: "xK9#mP2$qR7@nT4!"

// Customizado: 20 caracteres, sem símbolos
const password2 = generateSecurePassword(20, {
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false
});
// Exemplo: "xK9mP2qR7nT4wB5cY8zD"

// Apenas letras e números (8 caracteres)
const password3 = generateSecurePassword(8, {
  includeSymbols: false
});
// Exemplo: "xK9mP2qR"
```

**Opções:**
- `includeLowercase` (default: true) - a-z
- `includeUppercase` (default: true) - A-Z
- `includeNumbers` (default: true) - 0-9
- `includeSymbols` (default: true) - !@#$%^&*()_+-=[]{}|;:,.<>?

**Quando usar:**
- Gerar senhas temporárias para usuários
- Reset de senha automático
- Senhas de teste/desenvolvimento

---

## 🎫 Token Generation

### `generateSecureToken(length)`

Gera token criptograficamente seguro.

```typescript
import { generateSecureToken } from '../utils/crypto';

// Padrão: 32 bytes (64 caracteres hex)
const token1 = generateSecureToken();
// "a7b9c3d2e8f1g4h6i5j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9"

// Custom: 16 bytes (32 caracteres hex)
const token2 = generateSecureToken(16);
// "a7b9c3d2e8f1g4h6i5j7k8l9m0n1o2p3"
```

**Características:**
- ✅ Usa `crypto.getRandomValues()` (seguro)
- ✅ Output em hexadecimal
- ✅ Comprimento customizável
- ✅ Adequado para tokens de sessão, API keys, etc.

**Quando usar:**
- Tokens de sessão customizados
- API keys internas
- CSRF tokens
- Verificação de email

---

### `generateUUID()`

Gera UUID v4 padrão.

```typescript
import { generateUUID } from '../utils/crypto';

const uuid = generateUUID();
// "550e8400-e29b-41d4-a716-446655440000"
```

**Características:**
- ✅ UUID v4 padrão RFC 4122
- ✅ Usa `crypto.randomUUID()` quando disponível
- ✅ Fallback para navegadores antigos
- ✅ Globalmente único

**Quando usar:**
- IDs de registros únicos
- Identificadores de transações
- Chaves primárias alternativas

---

## 🛡️ Sanitization

### `sanitizeInput(input)`

Sanitiza string para prevenir XSS.

```typescript
import { sanitizeInput } from '../utils/crypto';

const userInput = "<script>alert('xss')</script>";
const safe = sanitizeInput(userInput);
console.log(safe);
// "<script>alert('xss')</script>"
```

**Caracteres escapados:**
- `&` → `&`
- `<` → `<`
- `>` → `>`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

**Quando usar:**
- Exibir input de usuário no HTML
- Prevenir ataques XSS
- Sanitizar antes de salvar no banco
- Comentários, avaliações, nomes de usuário

---

### `cleanAlphanumeric(input, allowSpaces)`

Remove caracteres não alfanuméricos.

```typescript
import { cleanAlphanumeric } from '../utils/crypto';

cleanAlphanumeric("Hello! @World#123", false);
// "HelloWorld123"

cleanAlphanumeric("Hello! @World#123", true);
// "Hello World123"

cleanAlphanumeric("João@email.com", false);
// "Jooemailcom"
```

**Quando usar:**
- Validar usernames
- Limpar códigos promocionais
- Normalizar inputs de busca
- Remover caracteres especiais

---

## 🔄 Migração do Original

### Original: `cripto.js`

```javascript
const { genSalt, hash, compare } = require('bcryptjs');

function generateActivationKey() {
  return [...Array(4)]
    .map(() => Math.random().toString(36).substring(2, 6).toUpperCase())
    .join('-');
}

async function hashPassword(senha) {
  const salt = await genSalt(10);
  const hashedPassword = await hash(senha, salt);
  return hashedPassword;
}

async function verifyPassword(senha, hashedPassword) {
  return await compare(senha, hashedPassword);
}

module.exports = { generateActivationKey, hashPassword, verifyPassword };
```

### Novo: `crypto.ts`

```typescript
import { 
  generateActivationKey,
  hashPassword,
  verifyPassword
} from '../utils/crypto';

// Uso idêntico ao original
const key = generateActivationKey();
const hash = await hashPassword("senha123");
const isValid = await verifyPassword("senha123", hash);
```

### Diferenças Principais

| Aspecto | Original | Novo |
|---------|----------|------|
| **Biblioteca** | bcryptjs (Node.js) | Web Crypto API (universal) |
| **Hash Algorithm** | bcrypt | PBKDF2-SHA256 |
| **Salt Rounds** | 10 | 100,000 iterações |
| **Activation Key** | `Math.random()` | `crypto.getRandomValues()` |
| **Formato Key** | Variável (3-4 chars) | Fixo (4 chars) |
| **TypeScript** | ❌ | ✅ |
| **Browser Support** | ❌ | ✅ |
| **Deno Support** | ❌ | ✅ |

---

## 📚 Exemplos Práticos

### Exemplo 1: Checkout com Chaves de Ativação

```typescript
import { generateMultipleActivationKeys } from '../utils/crypto';

async function checkout(userId: string, gameIds: string[]) {
  // Gerar chaves únicas para cada jogo
  const keys = generateMultipleActivationKeys(gameIds.length);
  
  // Mapear jogos para chaves
  const gamesWithKeys = gameIds.map((gameId, index) => ({
    gameId,
    activationKey: keys[index]
  }));
  
  // Salvar no banco
  await savePurchase({
    userId,
    gamesWithKeys,
    date: new Date().toISOString()
  });
  
  return gamesWithKeys;
}
```

---

### Exemplo 2: Validação de Senha em Formulário

```typescript
import { validatePasswordStrength } from '../utils/crypto';
import { useState } from 'react';

function SignupForm() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState({ score: 0, feedback: [], isStrong: false });
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Validar força em tempo real
    const result = validatePasswordStrength(newPassword);
    setStrength(result);
  };
  
  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Senha"
      />
      
      {/* Indicador visual */}
      <div className="strength-meter">
        <div 
          className={`bar strength-${strength.score}`}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>
      
      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <ul className="feedback">
          {strength.feedback.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
      
      {/* Mensagem */}
      {strength.isStrong && <p className="text-green-500">✅ Senha forte!</p>}
    </div>
  );
}
```

---

### Exemplo 3: Sanitizar Input de Usuário

```typescript
import { sanitizeInput } from '../utils/crypto';

function CommentSection({ onSubmit }: { onSubmit: (comment: string) => void }) {
  const [comment, setComment] = useState('');
  
  const handleSubmit = () => {
    // Sanitizar antes de enviar
    const safeComment = sanitizeInput(comment);
    onSubmit(safeComment);
  };
  
  return (
    <div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Seu comentário..."
      />
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
}
```

---

### Exemplo 4: Validar Chave de Ativação

```typescript
import { 
  validateActivationKey, 
  formatActivationKey 
} from '../utils/crypto';

function ActivateGameForm() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  
  const handleActivate = async () => {
    // Tentar formatar chave
    const formatted = formatActivationKey(key);
    
    if (!formatted) {
      setError('Chave inválida. Deve ter 16 caracteres alfanuméricos.');
      return;
    }
    
    // Validar formato
    if (!validateActivationKey(formatted)) {
      setError('Formato de chave inválido.');
      return;
    }
    
    // Ativar no backend
    try {
      await activateGame(formatted);
      alert(`Jogo ativado com a chave: ${formatted}`);
    } catch (err) {
      setError('Chave não encontrada ou já utilizada.');
    }
  };
  
  return (
    <div>
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="XXXX-XXXX-XXXX-XXXX"
      />
      <button onClick={handleActivate}>Ativar</button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

---

### Exemplo 5: Gerar Token de Sessão

```typescript
import { generateSecureToken } from '../utils/crypto';

async function createSession(userId: string) {
  const sessionToken = generateSecureToken(32);
  
  // Salvar no banco com expiração
  await saveSession({
    userId,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  });
  
  return sessionToken;
}

async function validateSession(token: string) {
  const session = await getSession(token);
  
  if (!session) {
    throw new Error('Sessão inválida');
  }
  
  if (new Date() > new Date(session.expiresAt)) {
    throw new Error('Sessão expirada');
  }
  
  return session.userId;
}
```

---

## 🔒 Segurança

### Boas Práticas

✅ **DO (Faça):**
- Use `generateActivationKey()` para chaves de jogo
- Use `validatePasswordStrength()` em formulários de signup
- Use `sanitizeInput()` em todos os inputs de usuário
- Use `generateSecureToken()` para tokens de sessão
- Deixe Supabase gerenciar senhas de usuário

❌ **DON'T (Não faça):**
- Não use `Math.random()` para chaves ou tokens de segurança
- Não armazene senhas em texto plano
- Não confie em validação apenas no frontend
- Não exponha chaves de ativação antes da compra
- Não reutilize chaves de ativação

### Checklist de Segurança

- [ ] Chaves de ativação são únicas e aleatórias
- [ ] Senhas são gerenciadas pelo Supabase Auth
- [ ] Input de usuário é sempre sanitizado
- [ ] Tokens são criptograficamente seguros
- [ ] Validação de força de senha implementada
- [ ] XSS protection em comentários/avaliações
- [ ] Rate limiting em endpoints de autenticação

---

**Desenvolvido para SYNTHX Digital Game Store** 🎮🔐
