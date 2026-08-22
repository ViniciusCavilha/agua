# Água+

Protótipo de monitoramento inteligente de consumo de água, feito com Ionic Vue e TypeScript.

## Como rodar

```bash
npm install
npm run dev
```

O login é demonstrativo: o botão **Entrar** abre o dashboard.

## Estrutura

- `src/theme/tokens.ts`: tokens do design system.
- `src/components`: componentes reutilizáveis.
- `src/data/mock-data.ts`: dados fixos do dashboard.
- `src/views`: telas de Login e Dashboard.

## Isolamento dos dispositivos

Alertas e notificações técnicas carregam o `deviceId` desde a leitura ou mudança de status até a rota de detalhes. A tela observa mudanças no ID da rota e recarrega somente o dispositivo correspondente. Dispositivos simulados também recebem IDs locais e códigos `ESP32-FLOW-xxx` únicos, mantendo o mesmo contrato esperado para o futuro hardware real.
