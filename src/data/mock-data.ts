import { cashOutline, leafOutline, waterOutline, earthOutline } from 'ionicons/icons';

export const dashboardData = {
  today: '0 L',
  variation: 'Aguardando hidrômetro',
  target: 'Conecte um hidrômetro para iniciar a leitura dos dados.',
  monthly: [
    {
      label: 'Consumo total',
      value: '0 L',
      icon: waterOutline,
      color: 'water',
      description: 'Soma de toda a água registrada pelos medidores conectados neste mês.',
      insight: 'Aguardando dados reais do hidrômetro conectado ao Água+.',
    },
    {
      label: 'Economia gerada',
      value: '0 L',
      icon: leafOutline,
      color: 'success',
      description: 'Quantidade estimada de água economizada em comparação com o consumo histórico.',
      insight: 'Esse indicador será calculado quando houver histórico suficiente de consumo.',
    },
    {
      label: 'Valor economizado',
      value: 'R$ 0,00',
      icon: cashOutline,
      color: 'alert',
      description: 'Estimativa financeira baseada na tarifa configurada para a unidade monitorada.',
      insight: 'O valor será preenchido quando consumo e tarifa estiverem disponíveis.',
    },
    {
      label: 'Impacto ambiental',
      value: '0 árvores',
      icon: earthOutline,
      color: 'water',
      description: 'Conversão simbólica da economia de água em impacto ambiental positivo.',
      insight: 'O impacto ambiental será gerado automaticamente a partir da economia registrada.',
    },
  ],
};
