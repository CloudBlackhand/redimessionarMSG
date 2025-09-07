import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock,
  QrCode,
  Users,
  MessageSquare
} from 'lucide-react';
import { apiService } from '../services/api';
import { WahaSession, Chat, Group } from '../types';
import toast from 'react-hot-toast';

const WahaStatus = () => {
  const [wahaStatus, setWahaStatus] = useState<WahaSession | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWahaData();
  }, []);

  const loadWahaData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadStatus(),
        loadChats(),
        loadGroups(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do WAHA:', error);
      toast.error('Erro ao carregar dados do WAHA');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const status = await apiService.getWahaStatus();
      setWahaStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const loadChats = async () => {
    try {
      const chatsData = await apiService.getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadWahaData();
      toast.success('Dados atualizados com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      await apiService.createWahaSession();
      toast.success('Sessão criada com sucesso');
      await loadStatus();
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao criar sessão');
    }
  };

  const handleGetQrCode = async () => {
    try {
      const qr = await apiService.getQrCode();
      setQrCode(qr);
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      toast.error('Erro ao obter QR Code');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WORKING':
        return 'text-green-600 bg-green-100';
      case 'STARTING':
        return 'text-yellow-600 bg-yellow-100';
      case 'SCAN_QR_CODE':
        return 'text-blue-600 bg-blue-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WORKING':
        return <CheckCircle className="h-5 w-5" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WORKING':
        return 'Funcionando';
      case 'STARTING':
        return 'Iniciando';
      case 'SCAN_QR_CODE':
        return 'Aguardando QR Code';
      case 'FAILED':
        return 'Falhou';
      case 'STOPPED':
        return 'Parado';
      default:
        return status;
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
          <h1 className="text-2xl font-bold text-gray-900">Status WAHA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoramento da conexão WhatsApp
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-primary flex items-center"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Status da Sessão */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Status da Sessão</h3>
          {wahaStatus && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(wahaStatus.status)}`}>
              {getStatusIcon(wahaStatus.status)}
              <span className="ml-2">{getStatusText(wahaStatus.status)}</span>
            </div>
          )}
        </div>

        {wahaStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome da Sessão</label>
                <p className="text-sm text-gray-900">{wahaStatus.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Engine</label>
                <p className="text-sm text-gray-900">{wahaStatus.engine}</p>
              </div>
            </div>

            {wahaStatus.me && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informações do Usuário</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="text-sm text-gray-600">Nome</label>
                    <p className="text-sm text-gray-900">{wahaStatus.me.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">ID</label>
                    <p className="text-sm text-gray-900">{wahaStatus.me.id}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              {wahaStatus.status === 'STOPPED' && (
                <button
                  onClick={handleCreateSession}
                  className="btn btn-primary"
                >
                  Criar Sessão
                </button>
              )}
              
              {wahaStatus.status === 'SCAN_QR_CODE' && (
                <button
                  onClick={handleGetQrCode}
                  className="btn btn-secondary flex items-center"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Obter QR Code
                </button>
              )}
            </div>

            {qrCode && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code</h4>
                <p className="text-xs text-gray-600 break-all">{qrCode}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Use este código para conectar o WhatsApp
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sessão não encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crie uma nova sessão para conectar o WhatsApp
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateSession}
                className="btn btn-primary"
              >
                Criar Sessão
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Chats
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {chats.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-whatsapp-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Grupos
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {groups.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Chats com Mensagens
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {chats.filter(chat => chat.unreadCount > 0).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Grupos */}
      {groups.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Grupos Disponíveis</h3>
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-500">
                    {group.participantsCount} participantes
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {group.description || 'Sem descrição'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WahaStatus;
