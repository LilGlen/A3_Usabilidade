import React, { useState, useEffect } from "react";
// Certifique-se de que o caminho para o seu assets-map esteja correto
import { GAME_ASSETS } from "../../assets/assets-map"; 

// Imagem de Fallback Padrão (Estilo Gamer/Neon)
// Você pode trocar por uma imagem local importada se preferir: import fallbackLocal from '../../assets/fallback.png'
const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&q=80";

// --- Função de Construção de Caminho ---
function getGameAssetPath(gameName: string): string | null {
  if (!gameName) return null;

  // 1. Normaliza o nome do jogo para bater com as chaves do objeto (ex: "God of War" -> "god_of_war")
  const nomeNormalizado = gameName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Mantém letras, números, espaços e hífen
    .replace(/\s+/g, "_"); // Substitui espaços por _

  // 2. Busca o ativo no mapa estático
  // @ts-ignore - Ignora erro se a chave não existir
  const assetPath = GAME_ASSETS[nomeNormalizado];

  return assetPath || null;
}

// --- Componente de Imagem com Fallback ---
interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  gameName?: string; // Opcional, pois as vezes só queremos passar o src
  fallbackSrc?: string; // Permite passar um fallback personalizado se quiser
}

export function ImageWithFallback({
  gameName = "",
  src,
  alt,
  className,
  style,
  fallbackSrc,
  ...rest
}: ImageWithFallbackProps) {
  
  const finalFallback = fallbackSrc || DEFAULT_FALLBACK;
  
  // Estado para controlar a fonte atual da imagem
  const [imgSrc, setImgSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Resetar estado de erro quando as props mudarem
    setHasError(false);
    
    // 1. Prioridade: SRC direto (Link da API ou Import local)
    // Isso garante que se você salvar uma URL no admin, ela será usada.
    if (src && src.trim() !== "") {
      setImgSrc(src);
      return;
    }

    // 2. Prioridade: Asset Local Automático (baseado no nome do jogo)
    // Se não tiver src, tenta achar no mapa de assets.
    const assetPath = getGameAssetPath(gameName);
    if (assetPath) {
      setImgSrc(assetPath);
      return;
    }

    // 3. Se não tiver nada, seta o fallback imediatamente
    setImgSrc(finalFallback);
    
  }, [src, gameName, finalFallback]);

  // Função disparada se a imagem definida falhar ao carregar (link quebrado)
  const handleError = () => {
    if (!hasError) {
      console.warn(`[ImageFallback] Falha ao carregar: "${imgSrc}". Alternando para fallback.`);
      setHasError(true);
      setImgSrc(finalFallback);
    }
  };

  return (
    <img
      src={imgSrc || finalFallback}
      alt={alt ?? (gameName ? `Capa do jogo ${gameName}` : "Imagem do jogo")}
      onError={handleError}
      className={`transition-all duration-500 ${className}`}
      style={{
        objectFit: "cover",
        objectPosition: "center",
        width: "100%",
        height: "100%",
        // Se deu erro e está mostrando o fallback, aplica um efeito visual (opcional)
        opacity: hasError ? 0.8 : 1,
        filter: hasError ? "grayscale(40%)" : "none", 
        ...style
      }}
      {...rest}
    />
  );
}