import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { BotConfig, FormField } from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  config?: BotConfig | null;
}

const ConfigModal = ({ isOpen, onClose, onSave, config }: ConfigModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    greetingMessage: '',
    formMessage: '',
    targetGroupId: '',
    targetGroupName: '',
    isActive: true,
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGroups();
      if (config) {
        setFormData({
          name: config.name,
          greetingMessage: config.greetingMessage,
          formMessage: config.formMessage,
          targetGroupId: config.targetGroupId,
          targetGroupName: config.targetGroupName || '',
          isActive: config.isActive,
        });
        setFormFields(config.formFields);
      } else {
        setFormData({
          name: '',
          greetingMessage: 'Olá! Como posso ajudá-lo hoje?',
          formMessage: 'Por favor, preencha o formulário abaixo:',
          targetGroupId: '',
          targetGroupName: '',
          isActive: true,
        });
        setFormFields([
          {
            id: 'name',
            type: 'text',
            label: 'Nome Completo',
            placeholder: 'Digite seu nome completo',
            required: true,
          },
          {
            id: 'email',
            type: 'email',
            label: 'E-mail',
            placeholder: 'Digite seu e-mail',
            required: true,
          },
        ]);
      }
    }
  }, [isOpen, config]);

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const groups = await apiService.getGroups();
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos do WhatsApp');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da configuração é obrigatório');
      return;
    }

    if (formFields.length === 0) {
      toast.error('Adicione pelo menos um campo ao formulário');
      return;
    }

    onSave({
      ...formData,
      formFields,
    });
  };

  const addFormField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Novo Campo',
      placeholder: 'Digite aqui',
      required: false,
    };
    setFormFields([...formFields, newField]);
  };

  const updateFormField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormFields(updatedFields);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const moveFormField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...formFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFormFields(newFields);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {config ? 'Editar Configuração' : 'Nova Configuração'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações básicas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-group">
                    <label className="label">Nome da Configuração</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Bot de Vendas"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select
                      className="input"
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="form-group">
                  <label className="label">Mensagem de Saudação</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.greetingMessage}
                    onChange={(e) => setFormData({ ...formData, greetingMessage: e.target.value })}
                    placeholder="Mensagem enviada quando o usuário envia uma saudação"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Mensagem do Formulário</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.formMessage}
                    onChange={(e) => setFormData({ ...formData, formMessage: e.target.value })}
                    placeholder="Mensagem enviada antes do formulário"
                    required
                  />
                </div>

                {/* Grupo de destino */}
                <div className="form-group">
                  <label className="label">Grupo de Destino</label>
                  <div className="space-y-2">
                    <select
                      className="input"
                      value={formData.targetGroupId}
                      onChange={(e) => {
                        const selectedGroup = availableGroups.find(g => g.id === e.target.value);
                        setFormData({
                          ...formData,
                          targetGroupId: e.target.value,
                          targetGroupName: selectedGroup?.name || '',
                        });
                      }}
                      disabled={isLoadingGroups}
                    >
                      <option value="">Selecione um grupo</option>
                      {availableGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name} ({group.participantsCount} participantes)
                        </option>
                      ))}
                    </select>
                    {isLoadingGroups && (
                      <p className="text-sm text-gray-500">Carregando grupos...</p>
                    )}
                  </div>
                </div>

                {/* Campos do formulário */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-4">
                    <label className="label">Campos do Formulário</label>
                    <button
                      type="button"
                      onClick={addFormField}
                      className="btn btn-secondary flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Campo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              Campo {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => moveFormField(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFormField(index, 'down')}
                              disabled={index === formFields.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFormField(index)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="label">Tipo</label>
                            <select
                              className="input"
                              value={field.type}
                              onChange={(e) => updateFormField(index, { type: e.target.value as any })}
                            >
                              <option value="text">Texto</option>
                              <option value="email">E-mail</option>
                              <option value="phone">Telefone</option>
                              <option value="number">Número</option>
                              <option value="textarea">Texto Longo</option>
                              <option value="select">Seleção</option>
                            </select>
                          </div>
                          <div>
                            <label className="label">Label</label>
                            <input
                              type="text"
                              className="input"
                              value={field.label}
                              onChange={(e) => updateFormField(index, { label: e.target.value })}
                              placeholder="Nome do campo"
                            />
                          </div>
                          <div>
                            <label className="label">Placeholder</label>
                            <input
                              type="text"
                              className="input"
                              value={field.placeholder || ''}
                              onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                              placeholder="Texto de ajuda"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={field.required}
                                onChange={(e) => updateFormField(index, { required: e.target.checked })}
                              />
                              <span className="text-sm text-gray-700">Obrigatório</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto sm:ml-3"
              >
                {config ? 'Atualizar' : 'Criar'} Configuração
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
