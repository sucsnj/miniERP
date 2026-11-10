/**
 * src/components/import/ItemNameDropdown.tsx
 *
 * Campo com busca de itens cadastrados (produtos/serviços) usado na
 * coluna "Item no Sistema" do ImportItemsModal. Seletor com sugestões
 * (busca com debounce), extraído do modal para isolamento e reuso.
 * Ver docs/components/ItemNameDropdown.md.
 */

import { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import importStyles from '../../styles/modalImport.module.css';
import { fetchProducts, fetchServices } from '../../services/produtosService';
import type { ItemWithStatus } from '../../hooks/useImportItems';

export interface SuggestionItem {
  id: number;
  type: 'PRODUTO' | 'SERVICO';
  name: string;
  salePrice: number;
  stock?: number;
  internalCode?: string;
  ean?: string;
  categoryName?: string;
}

interface ItemNameDropdownProps {
  item: ItemWithStatus;
  onSelectSuggestion: (suggestion: SuggestionItem) => void;
  onTextChange: (newText: string) => void;
  disabled?: boolean;
}

const ItemNameDropdown: React.FC<ItemNameDropdownProps> = ({
  item,
  onSelectSuggestion,
  onTextChange,
  disabled = false,
}) => {
  const [term, setTerm] = useState(item.descricao || '');
  const [prevDescription, setPrevDescription] = useState(item.descricao || '');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (item.descricao !== prevDescription) {
    setPrevDescription(item.descricao || '');
    setTerm(item.descricao || '');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runSearch = async (text: string) => {
    const query = text.trim();
    if (!query) {
      setSuggestions([]);
      setLoading(false);
      setHasSearched(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const [prodRes, servRes] = await Promise.all([
        fetchProducts({ search: query, page: 1, pageSize: 8 }),
        fetchServices({ search: query, page: 1, pageSize: 8 }),
      ]);

      const products: SuggestionItem[] = (prodRes.items || []).map((p) => ({
        id: p.id,
        type: 'PRODUTO',
        name: p.nome,
        salePrice: p.preco_venda,
        stock: p.estoque,
        internalCode: p.codigo_interno,
        ean:
          p.codigos_barras?.find((b) => b.principal === 1)?.codigo_barras ||
          p.codigos_barras?.[0]?.codigo_barras ||
          '',
        categoryName: p.categoria_nome,
      }));

      const services: SuggestionItem[] = (servRes.items || []).map((s) => ({
        id: s.id,
        type: 'SERVICO',
        name: s.nome,
        salePrice: s.preco_venda,
        internalCode: s.codigo_interno,
        categoryName: s.categoria_nome,
      }));

      setSuggestions([...products, ...services]);
      setIsOpen(true);
    } catch (err) {
      console.error('Erro na busca de sugestões:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTerm(val);
    onTextChange(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (val.trim().length > 0) {
      setLoading(true);
      setIsOpen(true);
      timeoutRef.current = setTimeout(() => {
        runSearch(val);
      }, 250);
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setHasSearched(false);
      setLoading(false);
    }
  };

  const handleSelect = (s: SuggestionItem) => {
    setTerm(s.name);
    onSelectSuggestion(s);
    setIsOpen(false);
  };

  return (
    <div className={importStyles.dropdownContainer} ref={containerRef}>
      <div className={importStyles.inputWithIcon}>
        <input
          type="text"
          className={importStyles.nomeInput}
          value={term}
          onChange={handleInputChange}
          onFocus={() => {
            if (hasSearched && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          placeholder="Digite para buscar itens..."
          title="Digite para buscar products/serviços cadastrados"
        />
        <SearchIcon className={importStyles.searchFieldIcon} fontSize="inherit" />
      </div>

      {isOpen && (
        <div className={importStyles.dropdownMenu}>
          {loading ? (
            <div className={importStyles.dropdownLoading}>
              <div className={importStyles.spinnerMini} />
              <span>Buscando itens...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className={importStyles.dropdownHeader}>Itens encontrados no sistema:</div>
              <ul className={importStyles.dropdownList}>
                {suggestions.map((s) => (
                  <li
                    key={`${s.type}-${s.id}`}
                    className={importStyles.dropdownItem}
                    onClick={() => handleSelect(s)}
                  >
                    <div className={importStyles.dropdownItemHeader}>
                      <span className={importStyles.dropdownItemNome}>{s.name}</span>
                      <span
                        className={
                          s.type === 'PRODUTO'
                            ? importStyles.typeBadgeProd
                            : importStyles.typeBadgeServ
                        }
                      >
                        {s.type === 'PRODUTO' ? 'PRODUTO' : 'SERVIÇO'}
                      </span>
                    </div>
                    <div className={importStyles.dropdownItemMeta}>
                      <span>
                        R${' '}
                        {s.salePrice.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      {s.type === 'PRODUTO' && <span>Estoque: {s.stock ?? 0}</span>}
                      {s.ean && <span>EAN: {s.ean}</span>}
                      {s.internalCode && <span>Cód: {s.internalCode}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : hasSearched ? (
            <div className={importStyles.dropdownEmpty}>
              Nenhum produto ou serviço encontrado para &quot;{term}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ItemNameDropdown;
