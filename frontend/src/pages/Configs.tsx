import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import { BotConfig } from '../types';
import toast from 'react-hot-toast';
import ConfigModal from '../components/ConfigModal';

const Configs = () => {
  const [configs, setConfigs] = useState<BotConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BotConfig | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleEditConfig = (config: BotConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      await apiService.deleteConfig(id);
      toast.success('Configuração excluída com sucesso');
      loadConfigs();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast.error('Erro ao excluir configuração');
    }
  };

  const handleSaveConfig = async (configData: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingConfig) {
        await apiService.updateConfig(editingConfig.id, configData);
        toast.success('Configuração atualizada com sucesso');
      } else {
        await apiService.createConfig(configData);
        toast.success('Configuração criada com sucesso');
      }
      setIsModalOpen(false);
      loadConfigs();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as configurações dos bots WhatsApp
          </p>
        </div>
        <button
          onClick={handleCreateConfig}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Configuração
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma configuração encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            Crie sua primeira configuração de bot para começar
          </p>
          <button
            onClick={handleCreateConfig}
            className="btn btn-primary"
          >
            Criar Configuração
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <div key={config.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {config.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    config.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Mensagem de saudação:</span>
                  <br />
                  <span className="text-gray-500">{config.greetingMessage}</span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Campos do formulário:</span> {config.formFields.length}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Grupo de destino:</span>
                  <br />
                  <span className="text-gray-500">
                    {config.targetGroupName || config.targetGroupId || 'Não configurado'}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditConfig(config)}
                    className="p-2 text-gray-400 hover:text-primary-600"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(config.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConfig}
        config={editingConfig}
      />
    </div>
  );
};

export default Configs;
