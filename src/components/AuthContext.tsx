import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useToast } from "./ToastProvider";
import {
  API_URL,
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
} from "../types/api-endpoints";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  joinDate: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    dataNascimento: string
  ) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfileToRole = (perfil: string): "admin" | "user" => {
  const p = perfil.toLowerCase();
  if (p === "administrador") return "admin";
  if (p === "cliente") return "user";
  return "user";
};

const rolePermissions: Record<"admin" | "user", string[]> = {
  admin: [
    "manage_companies",
    "manage_categories",
    "manage_games",
    "view_reports",
    "manage_users",
    "purchase_games",
    "review_games",
    "view_purchase_history",
  ],
  user: ["purchase_games", "review_games", "view_purchase_history"],
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp) {
      return decoded.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return true;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
    });
    localStorage.removeItem("synthx_token");
    localStorage.removeItem("synthx_user");

    showToast({
      type: "info",
      title: "Sessão encerrada",
      message: "Você saiu da sua conta.",
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const url = `${API_URL}${LOGIN_ENDPOINT}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      if (!response.ok) {
        // Pop-up para credenciais inválidas (401) ou usuário não encontrado (404)
        const errorData = await response.json();
        showToast({
          type: "error",
          title: "Erro ao entrar",
          message: errorData.message || "Credenciais inválidas.",
        });
        return false;
      }

      const data = await response.json();
      const token = data.token;

      const decoded: any = jwtDecode(token);

      if (!decoded || !decoded.perfil) {
        showToast({
          type: "error",
          title: "Erro interno",
          message: "Token inválido recebido do servidor.",
        });
        return false;
      }

      const role = mapProfileToRole(decoded.perfil);

      const user: User = {
        id: decoded.id.toString(),
        name: decoded.nome,
        email,
        role,
        joinDate: new Date().toISOString(),
      };

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        permissions: rolePermissions[role],
      });

      localStorage.setItem("synthx_token", token);
      localStorage.setItem("synthx_user", JSON.stringify(user));

      showToast({
        type: "success",
        title: "Bem-vindo",
        message: `Seja bem-vindo, ${user.name}!`,
      });

      return true;
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      showToast({
        type: "error",
        title: "Falha no servidor",
        message: "Não foi possível conectar à API.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    dataNascimento: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const url = `${API_URL}${REGISTER_ENDPOINT}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name,
          email,
          senha: password,
          dataNascimento: dataNascimento,
        }),
      });

      if (!response.ok) {
        // Pop-up para erro de cadastro (e-mail já em uso - 409, ou erro de validação - 400)
        const errorData = await response.json();
        showToast({
          type: "error",
          title: "Erro no cadastro",
          message: errorData.message || "E-mail já está em uso.",
        });
        return false;
      }
      return await login(email, password);
    } catch (err) {
      // Pop-up para falhas de rede no cadastro
      console.error("REGISTER ERROR:", err);
      showToast({
        type: "error",
        title: "Erro no servidor",
        message: "Não foi possível completar o cadastro.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) =>
    authState.permissions.includes(permission);

  useEffect(() => {
    const savedToken = localStorage.getItem("synthx_token");
    const savedUser = localStorage.getItem("synthx_user");

    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        logout();
      } else {
        const user: User = JSON.parse(savedUser);
        const permissions = rolePermissions[user.role];

        setAuthState({
          user,
          token: savedToken,
          isAuthenticated: true,
          permissions,
        });
      }
    }

    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        hasPermission,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
