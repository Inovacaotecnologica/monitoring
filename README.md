# Building Monitoring Site

Este projeto é um **protótipo completo** de um site de monitoramento predial, voltado para gestores de instalações, equipes de manutenção e integradores IoT. Ele foi desenvolvido com **Next.js (TypeScript)** e oferece uma base escalável para conectar dispositivos por diversos protocolos (HTTP, WebSocket e MQTT), acompanhar dados em tempo real e gerenciar um inventário de equipamentos.

## Principais recursos

- **Autenticação simples** por e‑mail/senha (persistência do token em `localStorage`).
- **Internacionalização (i18n)** em Português, Espanhol e Inglês com troca dinâmica de idioma no cabeçalho.
- **Tema claro/escuro** com persistência da preferência.
- **Layout responsivo** com cabeçalho, barra lateral e conteúdo principal.
- **Dashboard** com indicadores (KPIs), gráfico em tempo real e cartões de dispositivos; integra-se a múltiplos protocolos (HTTP polling, WebSocket ou MQTT).
- **CRUD completo de dispositivos**: páginas de lista e detalhe permitem criar, editar (em processo), excluir, ativar/desativar e filtrar dispositivos. O formulário de cadastro é dinâmico e apresenta campos específicos conforme o protocolo selecionado.
  Agora você também pode atribuir cada dispositivo a uma **empresa** e alternar seu estado **ligado/desligado** diretamente nos cartões ou na lista. Apenas os dispositivos da empresa selecionada pelo usuário são exibidos.
- **Suporte a múltiplos protocolos de comunicação**: HTTP/REST, WebSocket e MQTT (via WebSocket). Os campos específicos de cada protocolo são exibidos dinamicamente no formulário de cadastro.
  
  Além disso, o usuário pode pertencer a várias **empresas**. O menu lateral apresenta uma lista de empresas autorizadas; ao selecionar uma delas, o dashboard e as listas mostram apenas os dispositivos daquela empresa. A autenticação retorna a lista de empresas disponíveis.
- **Alertas e alarmes**: página dedicada mostra os alertas ativos e resolvidos, com opção de resolvê-los manualmente. Os alertas são gerados por regras de threshold em dispositivos (ou inseridos como demo).
- **Dispositivos de demonstração** (tanque, válvula e sensor) com telemetria e alarmes gerados aleatoriamente quando `NEXT_PUBLIC_DEMO=true`.

## Como rodar localmente

1. **Instale as dependências**:

   ```bash
   npm install
   ```

2. **Crie um arquivo `.env`** na raiz do projeto com base em `.env.example`. Os principais parâmetros são:

   - `SHEET_ID`/`SHEET_GID`: identificadores da planilha de usuários (para login).
   - `NEXT_PUBLIC_HTTP_API_URL`: URL base para telemetria via HTTP (ex.: `http://192.168.1.120/nivel`).
   - `NEXT_PUBLIC_MQTT_BROKER_URL`: URL do broker MQTT (WebSocket), ex.: `wss://broker.seudominio.com:9001`.
   - `NEXT_PUBLIC_MQTT_TOPIC`: tópico de telemetria (`predio/+/+/+/telemetry` por padrão).
   - `NEXT_PUBLIC_WS_URL`: URL do servidor WebSocket, se utilizar (ex.: `wss://api.seudominio.com/socket`).
   - `NEXT_PUBLIC_DEMO=true`: habilita dispositivos de demonstração e telemetria/alarmes fake.

3. **Execute em modo de desenvolvimento**:

   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000` no navegador. Use um usuário e senha válidos (definidos na planilha ou configurados no código) para fazer login.

## Estrutura do projeto

- **pages/** – contém as páginas do Next.js (login, dashboard, devices, settings). As rotas dinâmicas estão em `pages/devices/[id].tsx`.
- **components/** – componentes reutilizáveis (Layout, Header, Sidebar, DeviceCard, AddDeviceDialog, KpiCard, ChartRealtime, AlertsTable, LanguageSwitcher, ThemeToggle).
- **hooks/** – hooks personalizados (store de dispositivos, integração MQTT/WS/HTTP, i18n).
- **contexts/** – contexto de internacionalização e tema.
- **messages/** – arquivos JSON com as traduções PT/ES/EN.
- **public/images/** – ícones ilustrativos para os dispositivos.
- **styles/** – folhas de estilo globais (Tailwind ou CSS global).

## Observações

Este repositório é um ponto de partida. Ele não implementa todas as funcionalidades de forma completa (por exemplo, a configuração real dos protocolos ou persistência no backend), mas fornece a arquitetura, páginas e componentes necessários para estender e integrar com seu backend real. Ajuste as chamadas em `hooks/useMqttClient.ts`, `hooks/useWebSocket.ts` e `hooks/useHttpPolling.ts` de acordo com a sua infraestrutura.
