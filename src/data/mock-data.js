import { cashOutline, leafOutline, waterOutline, earthOutline } from 'ionicons/icons';

export const dashboardData = {
  today: '0 L',
  variation: 'Aguardando hidrometro',
  target: 'Conecte um hidrometro para iniciar a leitura dos dados.',
  monthly: [
    {
      label: 'Consumo total',
      value: '0 L',
      icon: waterOutline,
      color: 'water',
      description: 'Soma de toda a agua registrada pelos medidores conectados neste mes.',
      insight: 'Aguardando dados reais do hidrometro conectado ao Agua+.',
    },
    {
      label: 'Economia gerada',
      value: '0 L',
      icon: leafOutline,
      color: 'success',
      description: 'Quantidade estimada de agua economizada em comparacao com o consumo historico.',
      insight: 'Esse indicador sera calculado quando houver historico suficiente de consumo.',
    },
    {
      label: 'Valor economizado',
      value: 'R$ 0,00',
      icon: cashOutline,
      color: 'alert',
      description: 'Estimativa financeira baseada na tarifa configurada para a unidade monitorada.',
      insight: 'O valor sera preenchido quando consumo e tarifa estiverem disponiveis.',
    },
    {
      label: 'Impacto ambiental',
      value: '0 arvores',
      icon: earthOutline,
      color: 'water',
      description: 'Conversao simbolica da economia de agua em impacto ambiental positivo.',
      insight: 'O impacto ambiental sera gerado automaticamente a partir da economia registrada.',
    },
  ],
};
