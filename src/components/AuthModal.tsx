import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastProvider";

const isValidDateString = (dateString: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;

  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onLogin?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onLogin,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataNascimento: "",
  });

  const { login, register } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        dataNascimento: "",
      });
    }
  }, [isOpen, initialMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let success = false;

    try {
      if (mode === "login") {
        success = await login(formData.email, formData.password);

        if (!success) {
          // O erro já foi exibido pelo AuthContext.
        }
      } else {
        // VALIDAR SENHAS
        if (formData.password !== formData.confirmPassword) {
          showToast({
            type: "error",
            title: "Senhas não coincidem",
            message: "Por favor, verifique a confirmação de senha.",
          });
          return;
        }

        if (formData.password.length < 6) {
          showToast({
            type: "error",
            title: "Senha muito curta",
            message: "A senha deve ter pelo menos 6 caracteres.",
          });
          return;
        }

        if (!isValidDateString(formData.dataNascimento)) {
          showToast({
            type: "error",
            title: "Data inválida",
            message: "Use o formato DD/MM/AAAA.",
          });
          return;
        }

        // REALIZA CADASTRO
        success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.dataNascimento
        );

        // O próprio AuthContext já exibe o toast certo.
      }

      // SE DEU CERTO → Fecha modal e executa callback
      if (success) {
        onClose();
        if (onLogin) onLogin();
      }
    } catch (error) {
      console.error("Erro no handleSubmit:", error);
      showToast({
        type: "error",
        title: "Erro interno",
        message: "Ocorreu um erro inesperado ao processar sua requisição.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-secondary-bg rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-secondary-text hover:text-main-text transition-colors duration-200 hover:bg-main-bg rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-main-text mb-2">
            {mode === "login" ? "Entrar" : "Criar Conta"}
          </h2>
          <p className="text-secondary-text">
            {mode === "login" ? "Bem-vindo de volta!" : "Junte-se à SYNTHX"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOME */}
          {mode === "register" && (
            <div>
              <Label className="block text-secondary-text mb-2">
                Nome Completo
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Seu nome completo"
                required
                disabled={isLoading}
                className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4"
              />
            </div>
          )}

          {/* DATA DE NASCIMENTO */}
          {mode === "register" && (
            <div>
              <Label className="block text-secondary-text mb-2">
                Data de Nascimento (DD/MM/AAAA)
              </Label>
              <Input
                type="text"
                value={formData.dataNascimento}
                onChange={(e) =>
                  handleInputChange("dataNascimento", e.target.value)
                }
                placeholder="01/01/2000"
                required
                disabled={isLoading}
                pattern="\d{2}/\d{2}/\d{4}"
                title="Use o formato DD/MM/AAAA"
                className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <Label className="block text-secondary-text mb-2">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
              className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4"
            />
          </div>

          {/* SENHA */}
          <div>
            <Label className="block text-secondary-text mb-2">Senha</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Sua senha"
              required
              disabled={isLoading}
              minLength={6}
              className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4"
            />
          </div>

          {/* CONFIRMAR SENHA */}
          {mode === "register" && (
            <div>
              <Label className="block text-secondary-text mb-2">
                Confirmar Senha
              </Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirme sua senha"
                required
                disabled={isLoading}
                minLength={6}
                className="w-full bg-main-bg border border-border text-main-text rounded-lg py-2.5 px-4"
              />
            </div>
          )}

          {/* BOTÃO */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-purple hover:bg-accent-hover text-white font-bold py-3 px-6 rounded-lg mt-6 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "login" ? "Entrando..." : "Criando..."}
              </>
            ) : mode === "login" ? (
              "Entrar"
            ) : (
              "Criar Conta"
            )}
          </Button>
        </form>

        {/* Alternar modo */}
        <div className="text-center mt-6 pt-4 border-t border-border">
          <p className="text-secondary-text text-sm">
            {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-accent-purple hover:underline font-bold ml-1"
            >
              {mode === "login" ? "Cadastre-se" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
