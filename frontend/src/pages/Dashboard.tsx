import { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import { BotConfig, WahaSession, FormSubmission } from '../types';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [configs, setConfigs] = useState<BotConfig[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [wahaStatus, setWahaStatus] = useState<WahaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [configsData, submissionsData, wahaData] = await Promise.all([
        apiService.getConfigs(),
        apiService.getSubmissions(),
        apiService.getWahaStatus().catch(() => null),
      ]);

      setConfigs(configsData);
      setSubmissions(submissionsData);
      setWahaStatus(wahaData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
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
        return 'Aguardando QR';
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

  const activeConfigs = configs.filter(config => config.isActive);
  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema WhatsApp Bot
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bot className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Configurações Ativas
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {activeConfigs.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-8 w-8 text-whatsapp-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total de Submissões
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {submissions.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Submissões Hoje
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {submissions.filter(sub => {
                    const today = new Date();
                    const submissionDate = new Date(sub.submittedAt);
                    return submissionDate.toDateString() === today.toDateString();
                  }).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Status WAHA
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {wahaStatus ? getStatusText(wahaStatus.status) : 'Desconectado'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* WAHA Status */}
      {wahaStatus && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Status da Sessão WAHA</h3>
              <p className="text-sm text-gray-500">
                Sessão: {wahaStatus.name}
              </p>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(wahaStatus.status)}`}>
              {getStatusIcon(wahaStatus.status)}
              <span className="ml-2">{getStatusText(wahaStatus.status)}</span>
            </div>
          </div>
          {wahaStatus.me && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Conectado como:</span> {wahaStatus.me.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> {wahaStatus.me.id}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Submissions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Submissões Recentes</h3>
        {recentSubmissions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma submissão encontrada</p>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {submission.from.replace('@c.us', '')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center">
                  {submission.forwardedToGroup ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Configurations */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Ativas</h3>
        {activeConfigs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma configuração ativa</p>
        ) : (
          <div className="space-y-3">
            {activeConfigs.map((config) => (
              <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{config.name}</p>
                  <p className="text-sm text-gray-500">
                    {config.formFields.length} campos • Grupo: {config.targetGroupName || 'Não configurado'}
                  </p>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
