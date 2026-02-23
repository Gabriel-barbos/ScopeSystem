import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServiceService, Service } from "@/services/ServiceService";
import { EDITABLE_FIELDS, EXTRA_EDITABLE_FIELDS, buildTSV } from "./fields";


export function useServiceDrawer(service: Service | null, onClose: () => void) {
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState<Service | null>(null);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const { deleteService, updateService } = useServiceService();
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsEditing(false);
        setEdited(null);
    }, [service, onClose]);

    const current = edited ?? service;


    const handleEdit = () => {
        setEdited({ ...service! });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEdited(null);
        setIsEditing(false);
    };

    const handleUpdate = (field: keyof Service, value: any) => {
        setEdited((prev) => (prev ? { ...prev, [field]: value } : prev));
    };


    const handleSave = async () => {
        if (!edited) return;

        const payload = [...EDITABLE_FIELDS, ...EXTRA_EDITABLE_FIELDS].reduce(
            (acc, field) => ({ ...acc, [field]: edited[field] }),
            {} as Partial<Service>
        );

        try {
            await updateService.mutateAsync({ id: edited._id, payload });
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Serviço atualizado com sucesso!");
            setIsEditing(false);
            setEdited(null);
            onClose();
        } catch (error) {
            toast.error("Erro ao atualizar serviço");
            console.error(error);
        }
    };


    const handleDelete = async () => {
        if (!service) return;
        try {
            await deleteService.mutateAsync(service._id);
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Serviço excluído com sucesso!");
            setOpenDeleteModal(false);
            onClose();
        } catch (error) {
            toast.error("Erro ao excluir serviço");
            console.error(error);
        }
    };

   

    const handleCopyAll = async () => {
        if (!current) return;
        const tsv = buildTSV(current, current.notes ?? "");
        await navigator.clipboard.writeText(tsv);
        setCopied(true);
        toast.success("Dados copiados! Cole no Excel ");
        setTimeout(() => setCopied(false), 2000);
    };

    return {
        // State
        current,
        isEditing,
        openDeleteModal,
        copied,
        isSaving: updateService.isPending,
        isDeleting: deleteService.isPending,
        // Handlers
        handleEdit,
        handleCancel,
        handleUpdate,
        handleSave,
        handleDelete,
        handleCopyAll,
        setOpenDeleteModal,
    };
}