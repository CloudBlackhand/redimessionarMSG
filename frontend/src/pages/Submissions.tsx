import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { apiService } from '../services/api';
import { FormSubmission } from '../types';
import toast from 'react-hot-toast';

const Submissions = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
      toast.error('Erro ao carregar submissões');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace('@c.us', '');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submissões</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize todas as submissões de formulários recebidas
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma submissão encontrada
          </h3>
          <p className="text-gray-500">
            As submissões de formulários aparecerão aqui quando os usuários enviarem mensagens
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {formatPhoneNumber(submission.from)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {submission.fromName || 'Nome não informado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {submission.forwardedToGroup ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Encaminhado</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Não encaminhado</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{formatDate(submission.submittedAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="p-2 text-gray-400 hover:text-primary-600"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Preview dos dados */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(submission.formData).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="ml-1 text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                  {Object.keys(submission.formData).length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{Object.keys(submission.formData).length - 3} campos
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setSelectedSubmission(null)} 
            />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes da Submissão
                  </h3>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      <p className="text-sm text-gray-900">{formatPhoneNumber(selectedSubmission.from)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Data/Hora</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center">
                        {selectedSubmission.forwardedToGroup ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Encaminhado para o grupo</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Não foi encaminhado</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedSubmission.forwardedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Encaminhado em</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedSubmission.forwardedAt)}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Dados do Formulário
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium text-gray-700 w-1/3">{key}:</span>
                            <span className="text-gray-900 flex-1">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-secondary w-full sm:w-auto"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
