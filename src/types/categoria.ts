
// Tipos para categoria de produtos
export interface CategoriaFormData {
    nome: string;
    descricao: string;
}

export interface CategoriaOptions {
    abrirModalCategoria: () => void;
    salvarCategoria: React.FormEventHandler<HTMLFormElement>;
}