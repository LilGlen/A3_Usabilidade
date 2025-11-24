import { useState } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { useToast } from './ToastProvider';

export function GameDetailsPage() {
  const [activeMedia, setActiveMedia] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const { showToast } = useToast();

  const handleAddToCart = () => {
    showToast({
      type: 'success',
      title: 'Jogo adicionado ao carrinho!',
      message: 'Aventura Épica foi adicionado ao seu carrinho de compras.'
    });
  };

  const handleAddToWishlist = () => {
    showToast({
      type: 'info',
      title: 'Adicionado à lista de desejos!',
      message: 'Aventura Épica foi adicionado à sua lista de desejos.'
    });
  };
  
  const mediaItems = [
    "https://images.unsplash.com/photo-1562576649-daf535f7f4af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwYWR2ZW50dXJlJTIwZ2FtZSUyMGFydHdvcmt8ZW58MXx8fHwxNzU5Mzc5MjE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1708577269890-12a58e153589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGtpbmdkb20lMjBtYWdpY3xlbnwxfHx8fDE3NTkzNzkyMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1705594975210-02cbcc7af5ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMGJhdHRsZSUyMGdhbWV8ZW58MXx8fHwxNzU5Mzc5MjIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1723360480597-d21deccaf3d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBjYXIlMjBnYW1lfGVufDF8fHx8MTc1OTM1OTY5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1690814032913-d4b29033080c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b21iaWUlMjBzdXJ2aXZhbCUyMGdhbWV8ZW58MXx8fHwxNzU5Mzc5MjMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  ];

  const reviews = [
    {
      name: "Alex",
      date: "Há 2 semanas",
      comment: "Um dos melhores RPGs que joguei nos últimos anos. A história é cativante e o mundo é lindo. Recomendo!",
      avatar: "https://placehold.co/40x40/00BFFF/FFFFFF?text=A"
    },
    {
      name: "Beatriz",
      date: "Há 1 mês",
      comment: "O jogo é bom, mas encontrei alguns bugs que atrapalharam a experiência. Espero que corrijam em breve.",
      avatar: "https://placehold.co/40x40/DC3545/FFFFFF?text=B"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Coluna Esquerda: Mídia */}
        <div className="lg:col-span-3">
          <div className="bg-secondary-bg rounded-xl overflow-hidden mb-4">
            <img 
              src={mediaItems[activeMedia]} 
              alt="Mídia do jogo" 
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {mediaItems.map((media, index) => (
              <img
                key={index}
                src={media}
                alt={`Miniatura ${index + 1}`}
                className={`cursor-pointer rounded-lg border-2 w-20 h-20 object-cover transition ${
                  activeMedia === index 
                    ? 'border-accent-purple' 
                    : 'border-transparent hover:border-accent-purple'
                }`}
                onClick={() => setActiveMedia(index)}
              />
            ))}
          </div>
        </div>

        {/* Coluna Direita: Informações e Compra */}
        <div className="lg:col-span-2">
          <h1 className="text-5xl font-bold mb-2 text-main-text">Aventura Épica</h1>
          <p className="text-secondary-text mb-4">
            Por <span className="text-main-text">Estúdio Fantasia</span> | Lançado em 2023
          </p>
          
          <div className="flex items-center mb-6">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < 4 ? 'fill-current' : 'text-gray-600'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-secondary-text">(1,284 avaliações)</span>
          </div>
          
          <div className="bg-secondary-bg p-6 rounded-xl">
            <p className="text-4xl font-bold mb-6 text-main-text">R$ 129,99</p>
            <Button 
              className="w-full bg-accent-purple hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 mb-4"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Adicionar ao Carrinho
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-secondary-text text-secondary-text hover:bg-secondary-bg hover:text-main-text font-bold py-3 px-8 rounded-lg transition duration-300"
              onClick={handleAddToWishlist}
            >
              <Heart className="w-5 h-5 mr-2" />
              Adicionar à Lista de Desejos
            </Button>
          </div>
        </div>

        {/* Abas de Conteúdo */}
        <div className="lg:col-span-5 mt-8">
          <Tabs defaultValue="descricao" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger 
                value="descricao"
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
              >
                Descrição
              </TabsTrigger>
              <TabsTrigger 
                value="requisitos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
              >
                Requisitos
              </TabsTrigger>
              <TabsTrigger 
                value="avaliacoes"
                className="data-[state=active]:border-b-2 data-[state=active]:border-accent-purple data-[state=active]:text-main-text text-secondary-text"
              >
                Avaliações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="descricao" className="py-8">
              <p className="text-secondary-text leading-relaxed">
                "Aventura Épica" é um RPG de mundo aberto que leva os jogadores a uma jornada inesquecível por terras mágicas, 
                repletas de criaturas místicas, masmorras perigosas e reinos majestosos. Com um sistema de combate dinâmico e 
                uma narrativa profunda, cada escolha que você faz molda o destino do mundo. Personalize seu personagem, domine 
                habilidades poderosas e desvende os segredos de um mal antigo que ameaça consumir tudo.
              </p>
            </TabsContent>
            
            <TabsContent value="requisitos" className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-main-text">Mínimos</h3>
                  <ul className="text-secondary-text space-y-2">
                    <li><strong>SO:</strong> Windows 10 64-bit</li>
                    <li><strong>Processador:</strong> Intel Core i5-4460 / AMD FX-8350</li>
                    <li><strong>Memória:</strong> 8 GB de RAM</li>
                    <li><strong>Placa de vídeo:</strong> NVIDIA GeForce GTX 760 / AMD Radeon R7 260x</li>
                    <li><strong>Armazenamento:</strong> 50 GB de espaço disponível</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-4 text-main-text">Recomendados</h3>
                  <ul className="text-secondary-text space-y-2">
                    <li><strong>SO:</strong> Windows 11 64-bit</li>
                    <li><strong>Processador:</strong> Intel Core i7-8700K / AMD Ryzen 5 3600</li>
                    <li><strong>Memória:</strong> 16 GB de RAM</li>
                    <li><strong>Placa de vídeo:</strong> NVIDIA GeForce GTX 1070 / AMD Radeon RX Vega 56</li>
                    <li><strong>Armazenamento:</strong> 50 GB de espaço disponível (SSD)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avaliacoes" className="py-8">
              <h3 className="font-bold text-xl mb-4 text-main-text">Deixe sua avaliação</h3>
              <form className="bg-secondary-bg p-6 rounded-xl mb-8">
                <div className="mb-4">
                  <label className="block text-secondary-text mb-2">Sua nota:</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.preventDefault();
                          // Lógica para definir a nota
                        }}
                      >
                        <Star 
                          className="w-6 h-6 text-yellow-400 hover:fill-current cursor-pointer" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea 
                  className="w-full bg-main-bg border border-border text-main-text rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-accent-purple" 
                  rows={4} 
                  placeholder="Escreva sua opinião..."
                  aria-label="Comentário sobre o jogo"
                />
                <Button 
                  type="submit" 
                  className="bg-accent-purple hover:bg-accent-hover text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Enviar Avaliação
                </Button>
              </form>
              
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-border pb-4">
                    <div className="flex items-center mb-2">
                      <img 
                        src={review.avatar} 
                        alt="Avatar" 
                        className="rounded-full mr-4 w-10 h-10" 
                      />
                      <div>
                        <p className="font-bold text-main-text">{review.name}</p>
                        <p className="text-sm text-secondary-text">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-secondary-text">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}