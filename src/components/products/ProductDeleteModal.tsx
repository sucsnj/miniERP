import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ItemData } from '../../services/produtosService';

interface ProductDeleteModalProps {
    open: boolean;
    item: ItemData | null;
    onConfirm: () => void;
    onClose: () => void;
}

const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
    open,
    item,
    onConfirm,
    onClose,
}) => {
    if (!open || !item) return null;

    return (
        <ConfirmDialog
            open={open}
            title="Confirmar Exclusão"
            message={(
                <>
                    <p>Tem certeza de que deseja excluir o item <strong>{item.nome}</strong>?</p>
                    <p className="danger-text">Esta ação é irreversível e excluirá todos os códigos de barras associados a ele.</p>
                </>
            )}
            confirmText="Excluir"
            cancelText="Cancelar"
            danger
            confirmButtonId="confirm-delete-action-btn"
            cancelButtonId="cancel-delete-action-btn"
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
};

export default ProductDeleteModal;
