import React, { useState, useEffect } from "react";
import { GAME_ASSETS } from "../../assets/assets-map";

// Imagem de Fallback (Estilo Gamer/Neon para combinar com o tema)
const ERROR_IMG_SRC = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&q=80";

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
    .replace(/[^a-z0-9\s-]/g, "") // Mantém letras, números, espaços e hífen
    .replace(/\s/g, "_"); // Substitui espaços por _

  // 2. Busca o ativo no mapa estático
  // @ts-ignore - Ignora erro de tipagem se a chave não existir no map estrito
  const assetPath = GAME_ASSETS[nomeNormalizado];

  // Retorna a URL se existir, senão string vazia
  return assetPath || ""; 
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
  className,
  src,
  style,
  ...rest
}: ImageWithFallbackProps) {
  const assetPath = getGameAssetPath(gameName);
  
  // Define a fonte inicial
  const [imgSrc, setImgSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    
    // 1. Prioridade: Asset Local (se existir no mapa)
    if (assetPath) {
      setImgSrc(assetPath);
      return;
    }

    // 2. Prioridade: URL da API (se foi passada)
    if (src && src.trim() !== "") {
      setImgSrc(src);
      return;
    }

    // 3. Fallback imediato se não tiver nenhum dos dois
    setImgSrc(ERROR_IMG_SRC);
  }, [assetPath, src, gameName]);

  // Se a imagem definida falhar ao carregar, troca para o fallback
  const handleError = () => {
    if (imgSrc !== ERROR_IMG_SRC) {
      console.warn(`[ImageFallback] Falha ao carregar: ${imgSrc}. Usando imagem genérica.`);
      setImgSrc(ERROR_IMG_SRC);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc || ERROR_IMG_SRC}
      alt={alt ?? `Capa do jogo ${gameName}`}
      className={`transition-opacity duration-300 ${className}`}
      onError={handleError}
      style={{
        objectFit: "cover", // Garante que a imagem preencha o quadrado sem esticar
        objectPosition: "center",
        width: "100%", 
        height: "100%",
        opacity: hasError ? 0.8 : 1, // Leve transparência se for a imagem de erro
        ...style
      }}
      {...rest}
    />
  );
}