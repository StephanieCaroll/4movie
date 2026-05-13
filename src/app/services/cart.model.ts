export interface CartItem {
  $id?: string;         // ID gerado pelo Appwrite
  userId: string;       // ID do utilizador logado
  movieId: number;      // ID do filme (TMDB)
  title: string;        // Título para exibição
  posterPath: string;   // Caminho da imagem
  type: 'rent' | 'buy'; // Diferenciação entre aluguer e compra
  price: number;        // Preço fixado
  rentalDays?: string; // Dias de aluguer (se aplicável)
}