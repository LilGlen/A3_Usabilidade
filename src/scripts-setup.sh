#!/bin/bash

# ============================================
# SYNTHX - Setup Scripts
# ============================================
# Scripts úteis para configuração e validação do projeto

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# FUNÇÕES AUXILIARES
# ============================================

print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================
# SCRIPT 1: SETUP INICIAL
# ============================================

setup_initial() {
    print_header "SYNTHX - Setup Inicial"
    
    # 1. Verificar node_modules
    print_info "Verificando dependências..."
    if [ -d "node_modules" ]; then
        print_success "node_modules existe"
    else
        print_warning "node_modules não existe. Instalando..."
        npm install
        if [ $? -eq 0 ]; then
            print_success "Dependências instaladas com sucesso"
        else
            print_error "Erro ao instalar dependências"
            exit 1
        fi
    fi
    
    # 2. Verificar .env
    print_info "Verificando arquivo .env..."
    if [ -f ".env" ]; then
        print_success ".env existe"
    else
        print_warning ".env não existe. Criando a partir do template..."
        cp .env.example .env
        print_success ".env criado"
        print_warning "ATENÇÃO: Preencha o .env com suas credenciais Supabase!"
        print_info "Edite com: nano .env"
    fi
    
    # 3. Verificar .gitignore
    print_info "Verificando .gitignore..."
    if [ -f ".gitignore" ]; then
        if git check-ignore -q .env; then
            print_success ".env está sendo ignorado pelo Git"
        else
            print_error ".env NÃO está sendo ignorado!"
            print_warning "Adicione '.env' ao .gitignore"
        fi
    else
        print_error ".gitignore não existe!"
    fi
    
    print_success "Setup inicial completo!"
    print_info "Próximo passo: Preencha o .env e execute: npm run dev"
}

# ============================================
# SCRIPT 2: VALIDAR CONFIGURAÇÃO
# ============================================

validate_config() {
    print_header "SYNTHX - Validação de Configuração"
    
    local errors=0
    
    # 1. Verificar .env.example
    print_info "Verificando .env.example..."
    if [ -f ".env.example" ]; then
        print_success ".env.example existe"
    else
        print_error ".env.example NÃO existe"
        ((errors++))
    fi
    
    # 2. Verificar .gitignore
    print_info "Verificando .gitignore..."
    if [ -f ".gitignore" ]; then
        print_success ".gitignore existe"
        
        # Verificar se .env está ignorado
        if grep -q "^\.env$" .gitignore; then
            print_success ".env está no .gitignore"
        else
            print_warning ".env pode não estar sendo ignorado"
        fi
        
        # Verificar se node_modules está ignorado
        if grep -q "node_modules" .gitignore; then
            print_success "node_modules está no .gitignore"
        else
            print_error "node_modules NÃO está no .gitignore"
            ((errors++))
        fi
    else
        print_error ".gitignore NÃO existe"
        ((errors++))
    fi
    
    # 3. Verificar se .env existe
    print_info "Verificando .env local..."
    if [ -f ".env" ]; then
        print_success ".env existe"
        
        # Verificar se .env está no Git
        if git ls-files --error-unmatch .env 2>/dev/null; then
            print_error ".env ESTÁ NO GIT! Remova com: git rm --cached .env"
            ((errors++))
        else
            print_success ".env NÃO está no Git"
        fi
    else
        print_warning ".env não existe - crie com: cp .env.example .env"
    fi
    
    # 4. Verificar node_modules
    print_info "Verificando node_modules..."
    if [ -d "node_modules" ]; then
        print_success "node_modules existe"
        
        # Verificar se está no Git
        if git ls-files --error-unmatch node_modules 2>/dev/null; then
            print_error "node_modules ESTÁ NO GIT!"
            ((errors++))
        else
            print_success "node_modules NÃO está no Git"
        fi
    else
        print_warning "node_modules não existe - execute: npm install"
    fi
    
    # 5. Verificar arquivos .db
    print_info "Verificando arquivos .db..."
    if ls *.db 2>/dev/null; then
        print_warning "Arquivos .db encontrados (sistema antigo)"
        if git ls-files --error-unmatch *.db 2>/dev/null; then
            print_error "Arquivos .db ESTÃO NO GIT!"
            ((errors++))
        fi
    else
        print_success "Nenhum arquivo .db encontrado"
    fi
    
    # Resultado final
    echo ""
    if [ $errors -eq 0 ]; then
        print_success "Validação completa! Nenhum erro encontrado."
        return 0
    else
        print_error "Validação falhou com $errors erro(s)"
        return 1
    fi
}

# ============================================
# SCRIPT 3: LIMPAR ARQUIVOS SENSÍVEIS DO GIT
# ============================================

clean_sensitive_files() {
    print_header "SYNTHX - Limpar Arquivos Sensíveis"
    
    print_warning "Este script remove arquivos sensíveis do histórico do Git"
    print_warning "ATENÇÃO: Isso altera o histórico do Git!"
    
    read -p "Deseja continuar? (s/N): " confirm
    if [[ $confirm != [sS] ]]; then
        print_info "Operação cancelada"
        return
    fi
    
    # Remover .env se estiver rastreado
    if git ls-files --error-unmatch .env 2>/dev/null; then
        print_info "Removendo .env do Git..."
        git rm --cached .env
        print_success ".env removido do índice do Git"
    fi
    
    # Remover node_modules se estiver rastreado
    if git ls-files --error-unmatch node_modules 2>/dev/null; then
        print_info "Removendo node_modules do Git..."
        git rm -r --cached node_modules
        print_success "node_modules removido do índice do Git"
    fi
    
    # Remover arquivos .db se estiverem rastreados
    if git ls-files *.db 2>/dev/null | grep -q .; then
        print_info "Removendo arquivos .db do Git..."
        git rm --cached *.db
        print_success "Arquivos .db removidos do índice do Git"
    fi
    
    print_success "Limpeza completa!"
    print_info "Execute 'git commit -m \"chore: remove sensitive files\"' para commitar as mudanças"
}

# ============================================
# SCRIPT 4: TESTAR CONEXÃO COM BACKEND
# ============================================

test_backend() {
    print_header "SYNTHX - Testar Conexão Backend"
    
    # Ler URL do .env se existir
    if [ -f ".env" ]; then
        source .env 2>/dev/null
    fi
    
    # URL padrão se não estiver no .env
    BACKEND_URL="${SUPABASE_URL:-https://ceevveuntlqasbiwrlcb.supabase.co}/functions/v1/make-server-23051d03"
    
    print_info "Testando backend em: $BACKEND_URL"
    
    # Testar health check
    print_info "Testando /health..."
    response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        print_success "Backend está funcionando!"
        print_info "Resposta: $body"
    else
        print_error "Backend não está respondendo (HTTP $http_code)"
        print_info "Resposta: $body"
    fi
    
    # Testar endpoint de jogos
    print_info "Testando /games..."
    response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/games")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        print_success "Endpoint /games está funcionando!"
    else
        print_warning "Endpoint /games retornou HTTP $http_code"
    fi
}

# ============================================
# SCRIPT 5: EXECUTAR SEED
# ============================================

run_seed() {
    print_header "SYNTHX - Executar Seed"
    
    # Ler URL do .env se existir
    if [ -f ".env" ]; then
        source .env 2>/dev/null
    fi
    
    BACKEND_URL="${SUPABASE_URL:-https://ceevveuntlqasbiwrlcb.supabase.co}/functions/v1/make-server-23051d03"
    
    print_info "Executando seed em: $BACKEND_URL/seed"
    print_warning "Isso irá popular o banco de dados com dados de exemplo"
    
    read -p "Deseja continuar? (s/N): " confirm
    if [[ $confirm != [sS] ]]; then
        print_info "Operação cancelada"
        return
    fi
    
    response=$(curl -s -X POST "$BACKEND_URL/seed")
    
    if echo "$response" | grep -q "success"; then
        print_success "Seed executado com sucesso!"
        print_info "Resposta: $response"
    else
        print_error "Erro ao executar seed"
        print_info "Resposta: $response"
    fi
}

# ============================================
# MENU PRINCIPAL
# ============================================

show_menu() {
    print_header "SYNTHX - Scripts de Setup"
    echo ""
    echo "1) Setup Inicial (instalar deps, criar .env)"
    echo "2) Validar Configuração"
    echo "3) Limpar Arquivos Sensíveis do Git"
    echo "4) Testar Conexão Backend"
    echo "5) Executar Seed (popular banco)"
    echo "0) Sair"
    echo ""
}

# ============================================
# MAIN
# ============================================

main() {
    # Se receber argumento, executa comando específico
    if [ $# -gt 0 ]; then
        case $1 in
            setup)
                setup_initial
                ;;
            validate)
                validate_config
                ;;
            clean)
                clean_sensitive_files
                ;;
            test)
                test_backend
                ;;
            seed)
                run_seed
                ;;
            *)
                echo "Comando inválido: $1"
                echo "Use: setup, validate, clean, test, seed"
                exit 1
                ;;
        esac
        exit 0
    fi
    
    # Menu interativo
    while true; do
        show_menu
        read -p "Escolha uma opção: " choice
        
        case $choice in
            1)
                setup_initial
                ;;
            2)
                validate_config
                ;;
            3)
                clean_sensitive_files
                ;;
            4)
                test_backend
                ;;
            5)
                run_seed
                ;;
            0)
                print_info "Saindo..."
                exit 0
                ;;
            *)
                print_error "Opção inválida"
                ;;
        esac
        
        echo ""
        read -p "Pressione Enter para continuar..."
    done
}

# Executar main
main "$@"
