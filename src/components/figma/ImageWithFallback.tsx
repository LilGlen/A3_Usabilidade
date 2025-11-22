import React, { useState } from "react";
import { GAME_ASSETS } from "../../assets/assets-map";

// Placeholder para imagem não encontrada (SVG em Base64)
const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L2NpcmNsZT4KCg==";

// --- Função de Construção de Caminho ---
function getGameAssetPath(gameName: string): string {
  if (!gameName) {
    return "";
  }

  // 1. Normaliza o nome do jogo
  const nomeNormalizado = gameName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Mantém letras, números, espaços e hífen (para Half-Life)
    .replace(/\s/g, "_"); // Substitui espaços por _

  // 2. Busca o ativo no mapa estático
  const assetPath = GAME_ASSETS[nomeNormalizado as keyof typeof GAME_ASSETS];

  // Se o ativo for encontrado no mapa, ele será a URL pública (string); caso contrário, será undefined.
  return assetPath || ""; // Retorna a URL se existir, senão uma string vazia para forçar o fallback
}

// --- Componente de Imagem com Fallback ---
interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  gameName: string;
  src?: string;
}

export function ImageWithFallback({
  gameName,
  alt,
  style,
  className,
  ...rest
}: ImageWithFallbackProps) {
  const [didFailLocal, setDidFailLocal] = useState(false);
  const [didFailFallback, setDidFailFallback] = useState(false);

  const assetPath = getGameAssetPath(gameName);

  let finalSrc = assetPath;
  let currentAttempt = "local";

  // 1. Lógica de Decisão da Fonte (FinalSrc)

  if (didFailLocal) {
    // Se a tentativa local falhou, a próxima tentativa é o src da prop
    finalSrc = rest.src || ERROR_IMG_SRC;
    currentAttempt = "fallback";
  }

  if (didFailFallback || finalSrc === ERROR_IMG_SRC) {
    // Se a tentativa do fallback da API falhou, ou se não havia URL na prop 'src', vamos para o erro final.
    finalSrc = ERROR_IMG_SRC;
    currentAttempt = "error";
  }

  // 2. Handler de Erro
  const handleError = () => {
    if (currentAttempt === "local") {
      console.error(
        `[DEBUG - ${gameName}] ERRO DE CARREGAMENTO LOCAL: Tentativa de ${assetPath} falhou.`
      );
      setDidFailLocal(true); // Dispara a próxima renderização para tentar o fallback da API
    } else if (currentAttempt === "fallback") {
      console.error(
        `[DEBUG - ${gameName}] ERRO DE CARREGAMENTO DE FALLBACK (API): Tentativa de ${
          rest.src ? rest.src.substring(0, 50) + "..." : "Placeholder Vazio"
        } falhou.`
      );
      setDidFailFallback(true); // Dispara a próxima renderização para mostrar o SVG de erro
    }
  };

  // 3. Renderização
  const isErrorFallback =
    currentAttempt === "error" || finalSrc === ERROR_IMG_SRC;

  if (isErrorFallback) {
    console.warn(`[DEBUG - ${gameName}] FALHA TOTAL: Usando Imagem de Erro.`);
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${
          className ?? ""
        }`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={ERROR_IMG_SRC}
            alt={`Erro ao carregar imagem de ${gameName}`}
            {...rest}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      alt={alt ?? `Capa do jogo ${gameName}`}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
