/* JourFund language controls. Never translates stored journal data or input values. */
(function(){
'use strict';
const supported=['es','en','pt-BR'], names={es:'Español',en:'English','pt-BR':'Português (Brasil)'}, dictionary=new Map();
const rows=`Capital propio|Personal capital|Capital próprio
Agregar cuenta|Add account|Adicionar conta
Cuenta de fondeo|Funded account|Conta de avaliação
Guardar cuenta|Save account|Salvar conta
Registrar depósito|Record deposit|Registrar depósito
Depósitos|Deposits|Depósitos
Metas personales|Personal goals|Metas pessoais
Metas y límites personales|Personal goals and limits|Metas e limites pessoais
Explorar catálogo|Explore catalogue|Explorar catálogo
Ver operaciones|View trades|Ver operações
Usar esta cuenta|Use this account|Usar esta conta
Editar cuenta|Edit account|Editar conta
Eliminar cuenta|Delete account|Excluir conta
Multicuentas|Multiple accounts|Multicontas
Mis cuentas|My accounts|Minhas contas
Inicio|Home|Início
Operaciones|Trades|Operações
Cuentas|Accounts|Contas
Retiros|Withdrawals|Saques
Objetivos|Goals|Objetivos
Herramientas|Tools|Ferramentas
Ajustes|Settings|Configurações
Configuración|Settings|Configurações
Mi cuenta|My account|Minha conta
Más|More|Mais
Propietario|Owner|Proprietário
Trader|Trader|Trader
Notificaciones|Notifications|Notificações
Mercados|Markets|Mercados
Calendario económico|Economic calendar|Calendário econômico
Tu agenda de hoy|Today's agenda|Sua agenda de hoje
Personalizar avisos|Customize alerts|Personalizar alertas
Elegir mercado|Choose market|Escolher mercado
Agregar|Add|Adicionar
Eliminar|Delete|Excluir
Editar|Edit|Editar
Cancelar|Cancel|Cancelar
Cerrar|Close|Fechar
Guardar|Save|Salvar
Guardar cambios|Save changes|Salvar alterações
Confirmar|Confirm|Confirmar
Continuar|Continue|Continuar
Volver|Back|Voltar
Recargar|Reload|Recarregar
Ver detalle|View details|Ver detalhes
Ver datos individuales|View individual data|Ver dados individuais
Nueva operación|New trade|Nova operação
+ Nueva operación|+ New trade|+ Nova operação
Abrir operaciones|Open trades|Abrir operações
Historial de operaciones|Trade history|Histórico de operações
Resultado neto|Net result|Resultado líquido
Win rate|Win rate|Taxa de acerto
Cuenta activa|Active account|Conta ativa
CUENTA ACTIVA|ACTIVE ACCOUNT|CONTA ATIVA
Balance|Balance|Saldo
BALANCE|BALANCE|SALDO
Saltar al contenido|Skip to content|Pular para o conteúdo
Pérdida diaria disponible|Daily loss allowance|Limite de perda diária disponível
PÉRDIDA DIARIA DISPONIBLE|DAILY LOSS ALLOWANCE|LIMITE DE PERDA DIÁRIA DISPONÍVEL
Riesgo|Risk|Risco
Riesgo (%)|Risk (%)|Risco (%)
Fecha|Date|Data
Activo|Asset|Ativo
Resultado|Result|Resultado
Ganancia / Pérdida ($)|Profit / Loss ($)|Lucro / Prejuízo ($)
Lotaje (opcional)|Lot size (optional)|Lotes (opcional)
Lotaje|Lot size|Lotes
Estado|Status|Estado
Nota|Note|Nota
Notas|Notes|Notas
Ganancia|Profit|Lucro
Pérdida|Loss|Prejuízo
Win · Ganancia|Win · Profit|Win · Lucro
Loss · Pérdida|Loss · Loss|Loss · Prejuízo
Bien|Good|Bem
Ansioso|Anxious|Ansioso
MOLESTO|UPSET|IRRITADO
Capturas de la operación|Trade screenshots|Capturas da operação
Subir imágenes|Upload images|Enviar imagens
Adjuntar imágenes|Attach images|Anexar imagens
Qué pasó en la operación...|What happened in this trade...|O que aconteceu nesta operação...
Mis cuentas|My accounts|Minhas contas
Agregar cuenta|Add account|Adicionar conta
Crear cuenta|Create account|Criar conta
Catálogo de programas CFD|CFD program catalog|Catálogo de programas CFD
Todos|All|Todos
1 fase|1 phase|1 fase
2 fases|2 phases|2 fases
Instantánea|Instant funding|Financiamento instantâneo
Reglas de la cuenta|Account rules|Regras da conta
Objetivo|Target|Meta
Pérdida diaria|Daily loss|Perda diária
Pérdida máxima|Maximum loss|Perda máxima
Días mínimos|Minimum days|Dias mínimos
Tamaño de cuenta|Account size|Tamanho da conta
Financiada|Funded|Financiada
Evaluación|Evaluation|Avaliação
Fase 1|Phase 1|Fase 1
Fase 2|Phase 2|Fase 2
Grupos|Groups|Grupos
Multicuentas|Multi-account|Multicontas
Crear grupo|Create group|Criar grupo
Editar grupo|Edit group|Editar grupo
Nombre del grupo|Group name|Nome do grupo
Nombre de cuenta|Account name|Nome da conta
Capital|Capital|Capital
Progreso|Progress|Progresso
Etapa|Stage|Etapa
Datos individuales|Individual data|Dados individuais
Registrar retiro|Record withdrawal|Registrar saque
Recibido|Received|Recebido
Retiros registrados|Recorded withdrawals|Saques registrados
Historial de retiros|Withdrawal history|Histórico de saques
Importe|Amount|Valor
Detalles|Details|Detalhes
Cuenta financiada|Funded account|Conta financiada
Requisitos del ciclo|Cycle requirements|Requisitos do ciclo
Importes registrados|Recorded amounts|Valores registrados
Próxima revisión|Next review|Próxima revisão
Ver condiciones|View conditions|Ver condições
Meta diaria personal|Personal daily goal|Meta diária pessoal
Meta diaria|Daily goal|Meta diária
Objetivo de fase|Phase target|Meta da fase
Días registrados|Recorded days|Dias registrados
Tu camino|Your journey|Sua jornada
En curso|In progress|Em andamento
Próxima|Next|Próxima
Moneda|Currency|Moeda
Disciplina de hoy|Today's discipline|Disciplina de hoje
Tu proceso, tu mejor ventaja.|Your process, your greatest edge.|Seu processo, sua maior vantagem.
Plan definido|Plan defined|Plano definido
Riesgo revisado|Risk reviewed|Risco revisado
Diario actualizado|Journal updated|Diário atualizado
Diario pendiente|Journal pending|Diário pendente
Registrá lo que pasó.|Record what happened.|Registre o que aconteceu.
Listo|Done|Pronto
Editar meta diaria|Edit daily goal|Editar meta diária
Un plan claro. Un paso a la vez.|A clear plan. One step at a time.|Um plano claro. Um passo de cada vez.
Tus metas personales no reemplazan las reglas de la firma.|Personal goals do not replace the firm's rules.|Suas metas pessoais não substituem as regras da empresa.
Resumen semanal|Weekly summary|Resumo semanal
Esta semana|This week|Esta semana
Semana anterior|Previous week|Semana anterior
Operaciones ganadoras|Winning trades|Operações vencedoras
Operaciones perdedoras|Losing trades|Operações perdedoras
Calculadora de lotaje|Lot size calculator|Calculadora de lotes
Calculadora de riesgo|Risk calculator|Calculadora de risco
Valor de pips|Pip value|Valor dos pips
Tamaño de posición|Position size|Tamanho da posição
Tamaño de la posición|Position size|Tamanho da posição
Calcular|Calculate|Calcular
Instrumento|Instrument|Instrumento
Entrada|Entry|Entrada
Precio de entrada|Entry price|Preço de entrada
Stop loss|Stop loss|Stop loss
Take profit|Take profit|Take profit
Distancia del stop|Stop distance|Distância do stop
Riesgo monetario|Cash risk|Risco monetário
Margen|Margin|Margem
Apalancamiento|Leverage|Alavancagem
Aplicar a operación|Apply to trade|Aplicar à operação
Usar en operación|Use in trade|Usar na operação
Apariencia|Appearance|Aparência
Violeta|Violet|Violeta
Esmeralda|Emerald|Esmeralda
Azul|Blue|Azul
Creatividad y enfoque|Creativity and focus|Criatividade e foco
Calma y claridad|Calm and clarity|Calma e clareza
Precisión y orden|Precision and order|Precisão e organização
Elegí la paleta de tu espacio de trabajo.|Choose your workspace palette.|Escolha a paleta do seu espaço de trabalho.
Preferencias del diario|Journal preferences|Preferências do diário
Idioma de la aplicación|App language|Idioma do aplicativo
Cambiar idioma|Change language|Mudar idioma
Aplicar idioma|Apply language|Aplicar idioma
Podés cambiarlo cuando quieras.|You can change it anytime.|Você pode mudar quando quiser.
Nombre para mostrar|Display name|Nome de exibição
Guardar nombre|Save name|Salvar nome
Tu perfil|Your profile|Seu perfil
Tu perfil y tus datos, en un solo lugar.|Your profile and data, all in one place.|Seu perfil e seus dados, em um só lugar.
Datos y respaldos|Data and backups|Dados e backups
Opciones de recuperación|Recovery options|Opções de recuperação
Exportá un respaldo antes de descartar cambios de este dispositivo.|Export a backup before discarding changes on this device.|Exporte um backup antes de descartar alterações neste dispositivo.
Podés cambiar tu nombre una vez cada 30 días.|You can change your name once every 30 days.|Você pode mudar seu nome uma vez a cada 30 dias.
Sincronizar ahora|Sync now|Sincronizar agora
Exportar respaldo|Export backup|Exportar backup
Importar respaldo|Import backup|Importar backup
Cargar versión de la nube|Load cloud version|Carregar versão da nuvem
Reiniciar copia local y cargar nube|Reset local copy and load cloud|Redefinir cópia local e carregar nuvem
Cerrar sesión|Sign out|Sair
Sincronizado|Synced|Sincronizado
Guardando…|Saving…|Salvando…
Cargando datos…|Loading data…|Carregando dados…
Cargando tus datos…|Loading your data…|Carregando seus dados…
Pendiente|Pending|Pendente
Sin sesión|Signed out|Sem sessão
Configurar cuenta activa|Configure active account|Configurar conta ativa
Bienvenido de nuevo|Welcome back|Bem-vindo de volta
Creá tu cuenta|Create your account|Crie sua conta
Entrar|Sign in|Entrar
Iniciar sesión|Sign in|Entrar
Registrarse|Sign up|Cadastrar-se
Correo electrónico|Email address|E-mail
Contraseña|Password|Senha
Continuar con Google|Continue with Google|Continuar com Google
Restablecer contraseña|Reset password|Redefinir senha
Guardar nueva contraseña|Save new password|Salvar nova senha
Tu trading. Tu progreso.|Your trading. Your progress.|Seu trading. Seu progresso.
Preparando tu espacio|Preparing your workspace|Preparando seu espaço
Sincronizando tus cuentas|Syncing your accounts|Sincronizando suas contas
Reintentar carga|Retry loading|Tentar carregar novamente
Comparar y recuperar|Compare and recover|Comparar e recuperar
Resolver sincronización|Resolve sync|Resolver sincronização
No se pudo abrir|Unable to open|Não foi possível abrir
Resolvé primero el conflicto de sincronización en Ajustes.|Resolve the sync conflict in Settings first.|Resolva primeiro o conflito de sincronização nas Configurações.
Esperá a que termine la sincronización.|Wait for synchronization to finish.|Aguarde a sincronização terminar.
Esperá a que se carguen tus datos.|Wait for your data to load.|Aguarde seus dados carregarem.
Iniciá sesión primero.|Sign in first.|Entre primeiro.
No hay notificaciones|No notifications|Nenhuma notificação
Marcar todas como leídas|Mark all as read|Marcar todas como lidas
Activar en este dispositivo|Enable on this device|Ativar neste dispositivo
Enviar prueba|Send test|Enviar teste
Recordatorio del diario|Journal reminder|Lembrete do diário
Impacto alto|High impact|Alto impacto
Impacto medio|Medium impact|Médio impacto
Impacto bajo|Low impact|Baixo impacto
Sesiones de mercado|Market sessions|Sessões de mercado
Abierto|Open|Aberto
Cerrado|Closed|Fechado
Londres|London|Londres
Nueva York|New York|Nova York
Tokio|Tokyo|Tóquio
Sídney|Sydney|Sydney
Información personal|Personal information|Informações pessoais
Información|Information|Informações
Acceso|Access|Acesso
Personalización|Personalization|Personalização
Preferencias|Preferences|Preferências
Idioma|Language|Idioma
A tu manera.|Your way.|Do seu jeito.
Tu espacio, siempre con vos.|Your workspace, always with you.|Seu espaço, sempre com você.
Datos y sincronización|Data and sync|Dados e sincronização
Correo de acceso|Sign-in email|E-mail de acesso
Foto de perfil|Profile photo|Foto de perfil
Cambiar foto|Change photo|Alterar foto
Quitar foto|Remove photo|Remover foto
Tu perfil en JourFund|Your JourFund profile|Seu perfil no JourFund
Sin conexión|Offline|Sem conexão
Revisar cambios|Review changes|Revisar alterações
Más opciones|More options|Mais opções
Cerrar menú|Close menu|Fechar menu
Tu centro de control diario, mercados, noticias y progreso.|Your daily hub for markets, news and progress.|Seu centro de controle diário, mercados, notícias e progresso.
Tu ejecución, tu historia.|Your execution, your story.|Sua execução, sua história.
Elegí tu cuenta. Conocé tus reglas.|Choose your account. Know your rules.|Escolha sua conta. Conheça suas regras.
Tu progreso convertido en resultados.|Your progress turned into results.|Seu progresso convertido em resultados.
Tu espacio. A tu manera.|Your space. Your way.|Seu espaço. Do seu jeito.
Personaliza tu identidad en JourFund.|Personalize your identity in JourFund.|Personalize sua identidade no JourFund.
Importes: USD|Amounts: USD|Valores: USD
La hora del servidor se configura en cada cuenta. Tus metas personales se ajustan desde Objetivos.|Set the server time in each account. Adjust personal goals in Goals.|Configure o horário do servidor em cada conta. Ajuste suas metas pessoais em Objetivos.
Eventos según tus monedas e impacto seleccionados.|Events based on your selected currencies and impact levels.|Eventos de acordo com suas moedas e níveis de impacto selecionados.
Abrir TradingView ↗|Open TradingView ↗|Abrir TradingView ↗
Pérdida diaria disponible|Daily loss allowance|Limite de perda diária disponível
Nombre guardado. Podrás cambiarlo de nuevo dentro de 30 días.|Name saved. You can change it again in 30 days.|Nome salvo. Você poderá alterá-lo novamente em 30 dias.
La sesión cambió.|Your session changed.|Sua sessão mudou.
Meta guardada para la cuenta activa.|Goal saved for the active account.|Meta salva para a conta ativa.
Operación guardada|Trade saved|Operação salva
Grupo guardado|Group saved|Grupo salvo
Metas guardadas|Goals saved|Metas salvas
Registros eliminados|Records deleted|Registros excluídos
Retiros guardados|Withdrawals saved|Saques salvos
Operación multicuentas guardada|Multi-account trade saved|Operação multicontas salva
Cargando…|Loading…|Carregando…
Sincronizando…|Syncing…|Sincronizando…
Comprobando conexión…|Checking connection…|Verificando conexão…
Guardado en este dispositivo. Sincronizando…|Saved on this device. Syncing…|Salvo neste dispositivo. Sincronizando…
Sincronizado.|Synced.|Sincronizado.
Fallida|Failed|Reprovada
Completada|Completed|Concluída
Límite diario|Daily limit|Limite diário
Objetivo alcanzado|Target reached|Meta alcançada
Cuenta quemada|Account breached|Conta violada
Cuenta y sincronización · JourFund v98|Account and sync · JourFund v98|Conta e sincronização · JourFund v98
Definir meta|Set goal|Definir meta
Buenos días|Good morning|Bom dia
Buenas tardes|Good afternoon|Boa tarde
Buenas noches|Good evening|Boa noite
Fase 1 · Challenge|Phase 1 · Challenge|Fase 1 · Challenge
Fase 2 · Challenge|Phase 2 · Challenge|Fase 2 · Challenge
Zona horaria de las sesiones|Session time zone|Fuso horário das sessões
Cerrada|Closed|Fechada
Abierta|Open|Aberta
(+1 día)|(+1 day)|(+1 dia)
Ahora|Now|Agora
Ver horarios de referencia|View reference hours|Ver horários de referência
No hay eventos para hoy según tus filtros.|No events today for your filters.|Não há eventos hoje com seus filtros.
+ Agregar par|+ Add pair|+ Adicionar par
Oro / Dólar|Gold / US Dollar|Ouro / Dólar
Plata / Dólar|Silver / US Dollar|Prata / Dólar
Bitcoin / Dólar|Bitcoin / US Dollar|Bitcoin / Dólar
Ethereum / Dólar|Ethereum / US Dollar|Ethereum / Dólar
Euro / Dólar|Euro / US Dollar|Euro / Dólar
Libra / Dólar|Pound / US Dollar|Libra / Dólar
Dólar / Yen|US Dollar / Yen|Dólar / Iene
Gráfico y cotizaciones por|Chart and quotes by|Gráfico e cotações por
Día|Day|Dia
Hora|Time|Hora
Evento|Event|Evento
Impacto|Impact|Impacto
Impacto Alto|High impact|Impacto alto
Impacto Medio|Medium impact|Impacto médio
Impacto Bajo|Low impact|Impacto baixo
Alto|High|Alto
Medio|Medium|Médio
Bajo|Low|Baixo
Abrir Forex Factory ↗|Open Forex Factory ↗|Abrir Forex Factory ↗
Actualizar|Refresh|Atualizar
Detalle del retiro|Withdrawal details|Detalhe do saque
Eliminar cuentas|Delete accounts|Excluir contas
Eliminar definitivamente|Delete permanently|Excluir definitivamente
Cuentas de este challenge|Accounts in this challenge|Contas deste challenge
Limpiar selección|Clear selection|Limpar seleção
Eliminar seleccionadas|Delete selected|Excluir selecionadas
Agregar a tus mercados|Add to your markets|Adicionar aos seus mercados
Buscar activo|Search asset|Buscar ativo
Elegir activo|Choose asset|Escolher ativo
Agregar favorito|Add favorite|Adicionar favorito
Más secciones|More sections|Mais seções
Configurar meta diaria|Set daily goal|Configurar meta diária
Abrir Mi cuenta|Open My account|Abrir Minha conta
Elegir cuenta activa|Choose active account|Escolher conta ativa
Mercado|Market|Mercado
Intervalo del gráfico|Chart interval|Intervalo do gráfico
Volver a Inicio|Back to Home|Voltar ao Início
Semana siguiente|Next week|Próxima semana
Mes anterior|Previous month|Mês anterior
Mes siguiente|Next month|Próximo mês
Filtrar empresa|Filter firm|Filtrar empresa
Filtrar fases|Filter phases|Filtrar fases
Filtrar cuenta|Filter account|Filtrar conta
Filtrar impacto|Filter impact|Filtrar impacto
Filtrar moneda|Filter currency|Filtrar moeda
Diario de trading|Trading journal|Diário de trading
Individuales|Individual|Individuais
+ Crear grupo|+ Create group|+ Criar grupo
Resultado neto de la etapa|Net result for the stage|Resultado líquido da etapa
📅 Calendario de operaciones|📅 Trading calendar|📅 Calendário de operações
Calendario de operaciones|Trading calendar|Calendário de operações
Lun|Mon|Seg
Mar|Tue|Ter
Mié|Wed|Qua
Jue|Thu|Qui
Vie|Fri|Sex
Sáb|Sat|Sáb
Dom|Sun|Dom
Operaciones de la etapa seleccionada|Trades in the selected stage|Operações da etapa selecionada
Fecha ↓|Date ↓|Data ↓
Fecha ↑|Date ↑|Data ↑
Acciones|Actions|Ações
Ver catálogo completo|View full catalog|Ver catálogo completo
+ Agregar|+ Add|+ Adicionar
Grupo|Group|Grupo
Programas y reglas de fondeo|Funding programs and rules|Programas e regras de financiamento
Instantánea / Prime|Instant / Prime|Instantânea / Prime
Agregar otra cuenta|Add another account|Adicionar outra conta
Sin evaluación|No evaluation|Sem avaliação
Configurar cuenta|Configure account|Configurar conta
Ver programa oficial ↗|View official program ↗|Ver programa oficial ↗
🟢 Activa|🟢 Active|🟢 Ativa
Activa|Active|Ativa
↻ Reiniciar cuenta|↻ Reset account|↻ Reiniciar conta
Reiniciar cuenta|Reset account|Reiniciar conta
+ Registrar retiro|+ Record withdrawal|+ Registrar saque
Balance actual|Current balance|Saldo atual
P&L de operaciones|Trading P&L|P&L das operações
Descontado del balance|Deducted from balance|Descontado do saldo
Importe recibido registrado|Recorded amount received|Valor recebido registrado
Revisión del ciclo|Cycle review|Revisão do ciclo
Ver condiciones →|View conditions →|Ver condições →
Cuenta seleccionada|Selected account|Conta selecionada
Sin retiros en este período.|No withdrawals in this period.|Sem saques neste período.
Reglas de retiro|Withdrawal rules|Regras de saque
Total retirado|Total withdrawn|Total sacado
Próximo retiro|Next withdrawal|Próximo saque
Tu actividad, con una mirada más clara.|Your activity, seen more clearly.|Sua atividade, com uma visão mais clara.
Semana actual|Current week|Semana atual
Mes actual|Current month|Mês atual
Solo operaciones|Trades only|Somente operações
Ganancia media|Average win|Ganho médio
Pérdida media|Average loss|Perda média
Sin meta|No goal|Sem meta
Definila abajo|Set it below|Defina abaixo
Mínimo de la fase|Phase minimum|Mínimo da fase
Guardar meta|Save goal|Salvar meta
Objetivo Fase 1|Phase 1 target|Meta Fase 1
Objetivo Fase 2|Phase 2 target|Meta Fase 2
Pérdida máxima disponible|Max loss available|Perda máxima disponível
Riesgo máximo|Max risk|Risco máximo
Consultar contrato|Check contract|Consultar contrato
Días operados|Days traded|Dias operados
Tu mesa de trabajo|Your workbench|Sua mesa de trabalho
Calculá antes de operar.|Calculate before you trade.|Calcule antes de operar.
Cuenta de referencia|Reference account|Conta de referência
Lotaje y riesgo|Lot size and risk|Lote e risco
Valor del pip|Pip value|Valor do pip
Calcular lotaje|Calculate lot size|Calcular lote
Limpiar precios|Clear prices|Limpar preços
Riesgo por operación|Risk per trade|Risco por operação
Seguridad|Security|Segurança
Protegé tu acceso y administrá tus sesiones.|Protect your access and manage your sessions.|Proteja seu acesso e gerencie suas sessões.
Verificación en dos pasos desactivada|Two-step verification off|Verificação em duas etapas desativada
Verificación en dos pasos activada|Two-step verification on|Verificação em duas etapas ativada
Activar verificación en dos pasos|Turn on two-step verification|Ativar verificação em duas etapas
Dispositivos con sesión abierta|Devices signed in|Dispositivos com sessão aberta
Actualizar sesiones|Refresh sessions|Atualizar sessões
Cerrar otras sesiones|Sign out other sessions|Encerrar outras sessões
Cerrar todas las sesiones|Sign out all sessions|Encerrar todas as sessões
Este dispositivo|This device|Este dispositivo
Fin de semana: no hay eventos. La agenda de la próxima semana aparece apenas Forex Factory la publique.|Weekend: no events. Next week's calendar shows up as soon as Forex Factory publishes it.|Fim de semana: sem eventos. A agenda da próxima semana aparece assim que a Forex Factory publicar.
Programas, fases y reglas de la firma|Programs, phases and firm rules|Programas, fases e regras da empresa
Tu broker, depósitos y metas personales|Your broker, deposits and personal goals|Sua corretora, depósitos e metas pessoais
Sincronizado ahora|Synced just now|Sincronizado agora
Sesiones Forex orientativas · Ajuste automático de horario de verano. Los feriados y horarios del bróker pueden variar.|Approximate Forex sessions · Daylight saving adjusts automatically. Holidays and broker hours may vary.|Sessões Forex aproximadas · Ajuste automático de horário de verão. Feriados e horários da corretora podem variar.
Sídney 08:00–17:00 · Tokio 09:00–18:00 · Londres 08:00–17:00 · Nueva York 08:00–17:00, en la hora local de cada ciudad. Semana orientativa: domingo 17:00 a viernes 17:00, hora de Nueva York. No representa horarios de bolsas ni de criptomonedas.|Sydney 08:00–17:00 · Tokyo 09:00–18:00 · London 08:00–17:00 · New York 08:00–17:00, in each city's local time. Approximate week: Sunday 17:00 to Friday 17:00, New York time. Does not represent stock exchange or crypto hours.|Sydney 08:00–17:00 · Tóquio 09:00–18:00 · Londres 08:00–17:00 · Nova York 08:00–17:00, no horário local de cada cidade. Semana aproximada: domingo 17:00 a sexta 17:00, horário de Nova York. Não representa horários de bolsas nem de criptomoedas.
Esperando la fuente de calendario. Revisá la configuración en Ajustes.|Waiting for the calendar source. Check the setup in Settings.|Aguardando a fonte do calendário. Revise a configuração em Ajustes.
Gráfico de mercado|Market chart|Gráfico de mercado
Cargando contenido de TradingView…|Loading TradingView content…|Carregando conteúdo do TradingView…
. La disponibilidad y los retrasos dependen del mercado.|. Availability and delays depend on the market.|. A disponibilidade e os atrasos dependem do mercado.
Hoy|Today|Hoje
Mañana|Tomorrow|Amanhã
Semana|Week|Semana
Todas|All|Todas
Medio o alto|Medium or high|Médio ou alto
Fuente: Forex Factory · exportación semanal. Los horarios pueden cambiar. La exportación disponible incluye eventos, moneda e impacto.|Source: Forex Factory · weekly export. Times may change. The available export includes events, currency and impact.|Fonte: Forex Factory · exportação semanal. Os horários podem mudar. A exportação disponível inclui eventos, moeda e impacto.
Ver sincronización en Mi cuenta|View sync in My account|Ver sincronização em Minha conta
Sesiones durante el día seleccionado|Sessions during the selected day|Sessões durante o dia selecionado
Grupo seleccionado|Selected group|Grupo selecionado
Haz clic en un día para registrar una operación|Click a day to record a trade|Clique em um dia para registrar uma operação
Todos los meses|All months|Todos os meses
Últimos movimientos de la cuenta seleccionada|Latest activity of the selected account|Últimos movimentos da conta selecionada
+ Operación|+ Trade|+ Operação
Todavía no hay operaciones. Registrá la primera y aparecerá acá.|No trades yet. Record your first one and it will show up here.|Ainda não há operações. Registre a primeira e ela aparecerá aqui.
Estadísticas|Statistics|Estatísticas
📊 Estadísticas|📊 Statistics|📊 Estatísticas
Una visión clara de tu rendimiento.|A clear view of your performance.|Uma visão clara do seu desempenho.
Período|Period|Período
Distribución de resultados|Results breakdown|Distribuição de resultados
operaciones|trades|operações
Sin operaciones en este período.|No trades in this period.|Sem operações neste período.
R acumuladas|Cumulative R|R acumulado
Mejor trade|Best trade|Melhor trade
Peor trade|Worst trade|Pior trade
Evolución del balance|Balance over time|Evolução do saldo
📈 Evolución del balance|📈 Balance over time|📈 Evolução do saldo
Evolución del balance · Ver detalle|Balance over time · View details|Evolução do saldo · Ver detalhes
Sin movimientos de balance en este período.|No balance changes in this period.|Sem movimentações de saldo neste período.
Estas estadísticas corresponden a la etapa activa. Los límites de riesgo conservan su estado actual.|These statistics cover the active stage. Risk limits keep their current status.|Estas estatísticas correspondem à etapa ativa. Os limites de risco mantêm o estado atual.
P&L acumulado|Cumulative P&L|P&L acumulado
mínimo de trading days|minimum trading days|mínimo de trading days
Gestión de riesgo|Risk management|Gestão de risco
Dentro de los límites registrados|Within recorded limits|Dentro dos limites registrados
Riesgo actual · independiente del mes seleccionado|Current risk · independent of the selected month|Risco atual · independente do mês selecionado
Disponible|Available|Disponível
Drawdown histórico|Historical drawdown|Drawdown histórico
Racha actual|Current streak|Sequência atual
Peor racha|Worst streak|Pior sequência
Drawdown máximo|Max drawdown|Drawdown máximo
Estimado con operaciones cerradas. Confirmá siempre los límites y el estado de tu cuenta en la plataforma de la firma.|Estimated from closed trades. Always confirm limits and your account status on the firm's platform.|Estimado com operações fechadas. Confirme sempre os limites e o estado da sua conta na plataforma da empresa.
Referencias de riesgo del servidor|Server risk references|Referências de risco do servidor
Opcional: copiá balance/equity y el piso de pérdida de tu dashboard. Sin estos datos se estima con operaciones cerradas del diario, sin flotantes ni picos intradía.|Optional: copy balance/equity and the loss floor from your dashboard. Without them, it is estimated from closed journal trades, without floating P&L or intraday peaks.|Opcional: copie saldo/equity e o piso de perda do seu dashboard. Sem esses dados, é estimado com operações fechadas do diário, sem flutuantes nem picos intradiários.
Día del servidor|Server day|Dia do servidor
Balance al abrir el día|Balance at day open|Saldo na abertura do dia
Equity al abrir el día|Equity at day open|Equity na abertura do dia
Equity actual|Current equity|Equity atual
Mayor equity alcanzado (trailing Zero)|Highest equity reached (trailing Zero)|Maior equity alcançado (trailing Zero)
Piso máximo de pérdida del dashboard|Dashboard max loss floor|Piso de perda máxima do dashboard
Guardar referencias|Save references|Salvar referências
Usar estimación del diario|Use journal estimate|Usar estimativa do diário
últimas operaciones|latest trades|últimas operações
Registrá operaciones o retiros para ver el balance.|Record trades or withdrawals to see the balance.|Registre operações ou saques para ver o saldo.
Elegir grupo|Choose group|Escolher grupo
Ganancias / (ganancias + pérdidas). Los BE no cuentan.|Wins / (wins + losses). BE trades don't count.|Ganhos / (ganhos + perdas). Os BE não contam.
Filtrar historial por mes|Filter history by month|Filtrar histórico por mês
Páginas del historial de operaciones|Trade history pages|Páginas do histórico de operações
Página anterior|Previous page|Página anterior
Página siguiente|Next page|Próxima página
+ Agregar cuenta|+ Add account|+ Adicionar conta
Elegí un modelo para registrar tu cuenta. Los tamaños se seleccionan al agregarla.|Choose a model to record your account. Sizes are selected when you add it.|Escolha um modelo para registrar sua conta. Os tamanhos são escolhidos ao adicioná-la.
Todas las empresas|All firms|Todas as empresas
Prime · por invitación|Prime · invitation only|Prime · por convite
Capital asignado por FundingPips|Capital allocated by FundingPips|Capital alocado pela FundingPips
FTMO verificado el 09/10/2026; FundedNext y FundingPips consultados el 04/10/2026. Las variantes anteriores se eligen en el formulario. Tu contrato y dashboard determinan las condiciones de tu cuenta.|FTMO verified on 10/09/2026; FundedNext and FundingPips checked on 10/04/2026. Earlier variants are chosen in the form. Your contract and dashboard set your account's conditions.|FTMO verificada em 09/10/2026; FundedNext e FundingPips consultadas em 04/10/2026. As variantes anteriores são escolhidas no formulário. Seu contrato e dashboard determinam as condições da sua conta.
Configuración manual desde tu contrato. Las variantes pueden tener condiciones distintas.|Manual setup from your contract. Variants may have different conditions.|Configuração manual a partir do seu contrato. As variantes podem ter condições diferentes.
Elegí la cuenta que querés usar en Mis cuentas.|Choose the account you want to use in My accounts.|Escolha a conta que deseja usar em Minhas contas.
Gestión|Management|Gestão
+ Nueva cuenta|+ New account|+ Nova conta
Nueva cuenta|New account|Nova conta
↻ Reiniciar progreso|↻ Reset progress|↻ Reiniciar progresso
Reglas de la cuenta activa|Active account rules|Regras da conta ativa
Editar reglas|Edit rules|Editar regras
Días mínimos por fase|Minimum days per phase|Dias mínimos por fase
Financiada / Master|Funded / Master|Financiada / Master
Objetivo de evaluación|Evaluation target|Meta da avaliação
No aplica|Not applicable|Não se aplica
Estático|Static|Estático
Reparto elegido|Chosen profit split|Divisão escolhida
Ciclo|Cycle|Ciclo
Riesgo agregado máximo|Max aggregate risk|Risco agregado máximo
Noticias, restricciones y fuentes|News, restrictions and sources|Notícias, restrições e fontes
Quick Strike: ganancias de operaciones <30 s deben permanecer por debajo del 30%. No copiar desde/hacia cuentas financiadas.|Quick Strike: profits from trades under 30 s must stay below 30%. No copying from/to funded accounts.|Quick Strike: lucros de operações <30 s devem ficar abaixo de 30%. Não copiar de/para contas financiadas.
Financiada: riesgo agregado máximo 3%; noticias ±5 min: solo 40% de las ganancias afectadas cuentan; pérdidas completas.|Funded: max aggregate risk 3%; news ±5 min: only 40% of affected profits count; losses count in full.|Financiada: risco agregado máximo 3%; notícias ±5 min: só 40% dos lucros afetados contam; perdas integrais.
Inactividad: 60 días. Sin plazo máximo de evaluación. Fines de semana permitidos. KYC y aprobación de la firma necesarios.|Inactivity: 60 days. No evaluation time limit. Weekends allowed. KYC and firm approval required.|Inatividade: 60 dias. Sem prazo máximo de avaliação. Fins de semana permitidos. KYC e aprovação da empresa necessários.
Cuenta existente: se conservaron objetivos y días. Confirmá edición y ciclo en Editar reglas.|Existing account: targets and days were kept. Confirm edition and cycle in Edit rules.|Conta existente: metas e dias foram mantidos. Confirme edição e ciclo em Editar regras.
Ficha oficial ↗|Official page ↗|Página oficial ↗
Reglas generales ↗|General rules ↗|Regras gerais ↗
Reiniciar progreso y conservar la cuenta|Reset progress and keep the account|Reiniciar progresso e manter a conta
Marcá las comprobaciones realizadas en el dashboard de la firma.|Tick the checks you completed on the firm's dashboard.|Marque as verificações feitas no dashboard da empresa.
Revisar saldo disponible|Check available balance|Verificar saldo disponível
Confirmar días y consistencia|Confirm days and consistency|Confirmar dias e consistência
Verificar condiciones del contrato|Check contract conditions|Verificar condições do contrato
Confirmar aprobación de la firma|Confirm firm approval|Confirmar aprovação da empresa
Este checklist personal no representa aprobación de la firma.|This personal checklist is not firm approval.|Este checklist pessoal não representa aprovação da empresa.
Últimos 3 meses|Last 3 months|Últimos 3 meses
Últimos 6 meses|Last 6 months|Últimos 6 meses
Últimos 12 meses|Last 12 months|Últimos 12 meses
Registro de importes recibidos ingresados en el diario.|Record of amounts received entered in the journal.|Registro dos valores recebidos inseridos no diário.
Estado PA|PA status|Status PA
Completá las fases para activar la etapa financiada|Complete the phases to unlock the funded stage|Conclua as fases para ativar a etapa financiada
Abrir centro de retiros|Open withdrawals center|Abrir central de saques
Objetivo mensual|Monthly target|Meta mensal
🎯 Objetivo mensual|🎯 Monthly target|🎯 Meta mensal
Inicio real del ciclo actual|Actual start of current cycle|Início real do ciclo atual
Retiros ya procesados por la firma|Withdrawals already processed by the firm|Saques já processados pela empresa
Advertencias confirmadas por la firma|Warnings confirmed by the firm|Avisos confirmados pela empresa
Mi contrato aplica los 4 días por concentración|My contract applies the 4-day concentration rule|Meu contrato aplica os 4 dias por concentração
Ingresá el inicio real después de un retiro procesado. Registrar una transferencia no reinicia automáticamente el ciclo.|Enter the actual start after a processed withdrawal. Recording a transfer does not restart the cycle automatically.|Informe o início real após um saque processado. Registrar uma transferência não reinicia o ciclo automaticamente.
Guardar datos del ciclo|Save cycle data|Salvar dados do ciclo
Se habilita en la etapa financiada|Available in the funded stage|Disponível na etapa financiada
Período de retiros|Withdrawal period|Período de saques
Cuenta o grupo del resumen|Account or group for the summary|Conta ou grupo do resumo
Sin operaciones con ganancia o pérdida|No winning or losing trades|Sem operações com ganho ou perda
Sin pérdidas registradas|No losses recorded|Sem perdas registradas
No hay operaciones registradas en esta semana.|No trades recorded this week.|Não há operações registradas nesta semana.
El avance corresponde a la fase activa. Los resultados de fases anteriores se conservan en el historial y no se suman al balance inicial de la siguiente fase.|Progress is for the active phase. Results from earlier phases stay in the history and are not added to the next phase's starting balance.|O avanço corresponde à fase ativa. Os resultados de fases anteriores ficam no histórico e não somam ao saldo inicial da fase seguinte.
Seguí los objetivos de tu programa.|Follow your program's targets.|Acompanhe as metas do seu programa.
Consultá las condiciones de retiro.|Check the withdrawal conditions.|Consulte as condições de saque.
Tu meta diaria personal|Your personal daily goal|Sua meta diária pessoal
Para la cuenta activa. Es una referencia personal, no una obligación ni una regla de la firma. Se calcula con las operaciones del día del servidor, incluidas las fases anteriores.|For the active account. It's a personal reference, not an obligation or a firm rule. It uses trades from the server day, including earlier phases.|Para a conta ativa. É uma referência pessoal, não uma obrigação nem uma regra da empresa. É calculada com as operações do dia do servidor, incluindo fases anteriores.
Meta de ganancia neta (USD)|Net profit goal (USD)|Meta de lucro líquido (USD)
Dejá vacío o ingresá 0 para desactivarla. El resultado no incluye retiros.|Leave empty or enter 0 to turn it off. The result excludes withdrawals.|Deixe vazio ou insira 0 para desativá-la. O resultado não inclui saques.
Referencias y límites de la cuenta · Ver detalle|Account references and limits · View details|Referências e limites da conta · Ver detalhes
Beneficio registrado / objetivo|Recorded profit / target|Lucro registrado / meta
Cada fase empieza desde el capital inicial. Las operaciones de las fases anteriores quedan guardadas.|Each phase starts from the initial capital. Trades from earlier phases stay saved.|Cada fase começa do capital inicial. As operações das fases anteriores ficam salvas.
JourFund sigue lo registrado en tu diario. La aprobación y el cumplimiento completos los confirma la firma.|JourFund tracks what's in your journal. Full approval and compliance are confirmed by the firm.|O JourFund acompanha o que está no seu diário. A aprovação e o cumprimento completos são confirmados pela empresa.
Resultado neto por día de la semana|Net result by weekday|Resultado líquido por dia da semana
Nube|Cloud|Nuvem
Tus datos se guardan en tu cuenta personal. Revisá el estado de sincronización antes de cambiar de dispositivo.|Your data is saved to your personal account. Check the sync status before switching devices.|Seus dados são salvos na sua conta pessoal. Verifique o status de sincronização antes de trocar de dispositivo.
Español|Spanish|Espanhol
Avisos basados en los datos registrados de tus cuentas. No incluyen operaciones abiertas del broker. Los importes y tu correo no se muestran en la pantalla bloqueada.|Alerts based on the data recorded in your accounts. They don't include open broker positions. Amounts and your email are not shown on the lock screen.|Avisos com base nos dados registrados das suas contas. Não incluem operações abertas na corretora. Valores e seu e-mail não aparecem na tela bloqueada.
Objetivos y condiciones de fase|Phase targets and conditions|Metas e condições de fase
Condiciones calculadas de retiro|Calculated withdrawal conditions|Condições de saque calculadas
Hora del recordatorio|Reminder time|Horário do lembrete
Zona horaria|Time zone|Fuso horário
Colombia / Perú|Colombia / Peru|Colômbia / Peru
México central|Central Mexico|México central
Desactivar este dispositivo|Turn off this device|Desativar este dispositivo
Este dispositivo todavía no tiene notificaciones externas activadas.|This device doesn't have external notifications turned on yet.|Este dispositivo ainda não tem notificações externas ativadas.
iPhone: instalá JourFund con Safari → Compartir → Agregar a pantalla de inicio (iOS 16.4 o posterior). Después abrila desde el ícono y activá los avisos. El sistema puede retrasar o silenciar la entrega.|iPhone: install JourFund with Safari → Share → Add to Home Screen (iOS 16.4 or later). Then open it from the icon and turn on alerts. The system may delay or silence delivery.|iPhone: instale o JourFund com Safari → Compartilhar → Adicionar à Tela de Início (iOS 16.4 ou posterior). Depois abra pelo ícone e ative os avisos. O sistema pode atrasar ou silenciar a entrega.
Mis alertas|My alerts|Meus alertas
+ Crear alerta|+ Create alert|+ Criar alerta
Recordatorios con tu mensaje y horario, o avisos por ganancia/pérdida registrada. Hasta 20 alertas por usuario.|Reminders with your message and time, or alerts for recorded profit/loss. Up to 20 alerts per user.|Lembretes com sua mensagem e horário, ou avisos por ganho/perda registrado. Até 20 alertas por usuário.
Preparar sesión|Prepare session|Preparar sessão
Revisar riesgo|Review risk|Revisar risco
Actualizar diario|Update journal|Atualizar diário
Revisión semanal|Weekly review|Revisão semanal
Creá una alerta o elegí una plantilla para empezar.|Create an alert or pick a template to start.|Crie um alerta ou escolha um modelo para começar.
Guardar / sincronizar preferencias|Save / sync preferences|Salvar / sincronizar preferências
Configuración disponible en la nube.|Settings available in the cloud.|Configuração disponível na nuvem.
Agenda y acompañamiento|Calendar and support|Agenda e acompanhamento
Mis alertas activas|My active alerts|Meus alertas ativos
Resumen económico del día|Daily economic summary|Resumo econômico do dia
Avisar antes de un evento|Alert before an event|Avisar antes de um evento
Horario de silencio|Quiet hours|Horário de silêncio
Hora del resumen|Summary time|Horário do resumo
Anticipación|Lead time|Antecedência
Impacto mínimo|Minimum impact|Impacto mínimo
Silencio desde|Quiet from|Silêncio a partir de
Hasta|Until|Até
Horarios según la zona seleccionada arriba. Las sesiones son orientativas y pueden coincidir con feriados. En horario de silencio se omiten los envíos; siguen disponibles en la app.|Times follow the zone selected above. Sessions are approximate and may fall on holidays. During quiet hours nothing is sent; alerts stay available in the app.|Horários conforme o fuso selecionado acima. As sessões são aproximadas e podem coincidir com feriados. No horário de silêncio os envios são omitidos; continuam disponíveis no app.
Calendario no disponible o desactualizado. No se enviarán avisos de noticias.|Calendar unavailable or out of date. No news alerts will be sent.|Calendário indisponível ou desatualizado. Não serão enviados avisos de notícias.
Fuente:|Source:|Fonte:
· exportación semanal, revisada cada 15 minutos. Los horarios pueden cambiar. Si la fuente está atrasada o no disponible, no se generan avisos de noticias.|· weekly export, checked every 15 minutes. Times may change. If the source is late or unavailable, no news alerts are generated.|· exportação semanal, verificada a cada 15 minutos. Os horários podem mudar. Se a fonte estiver atrasada ou indisponível, não são gerados avisos de notícias.
Balance del diario · USD|Journal balance · USD|Saldo do diário · USD
Cuánto vale un pip|What a pip is worth|Quanto vale um pip
Beneficio y pérdida|Profit and loss|Lucro e perda
Resultados potenciales|Potential results|Resultados potenciais
Niveles de salida|Exit levels|Níveis de saída
Margen requerido|Required margin|Margem necessária
Capital necesario|Capital needed|Capital necessário
Elegí cuánto arriesgar y calculá los lotes para tu stop.|Choose how much to risk and calculate the lots for your stop.|Escolha quanto arriscar e calcule os lotes para o seu stop.
Otro instrumento|Other instrument|Outro instrumento
Moneda del cálculo|Calculation currency|Moeda do cálculo
Dirección|Direction|Direção
Compra|Buy|Compra
Venta|Sell|Venda
Balance para el cálculo|Balance for the calculation|Saldo para o cálculo
Usa el balance de esta cuenta, incluyendo P&L y descuentos registrados.|Uses this account's balance, including recorded P&L and deductions.|Usa o saldo desta conta, incluindo P&L e descontos registrados.
Usar balance de esta cuenta automáticamente|Use this account's balance automatically|Usar o saldo desta conta automaticamente
Regla de riesgo|Risk rule|Regra de risco
Porcentaje del balance|Percent of balance|Percentual do saldo
Importe fijo|Fixed amount|Valor fixo
Take Profit (opcional)|Take Profit (optional)|Take Profit (opcional)
Para transferir también el RR.|To also carry over the RR.|Para transferir também o RR.
Especificaciones · Editables|Specifications · Editable|Especificações · Editáveis
Bróker / plataforma (opcional)|Broker / platform (optional)|Corretora / plataforma (opcional)
Método del valor de posición|Position value method|Método do valor da posição
Contrato × movimiento de precio|Contract × price move|Contrato × movimento de preço
Valor del tick del bróker|Broker tick value|Valor do tick da corretora
Unidades por lote|Units per lot|Unidades por lote
Ej.: 100 onzas para un contrato de oro.|E.g. 100 ounces for a gold contract.|Ex.: 100 onças para um contrato de ouro.
Tamaño de 1 pip / punto|Size of 1 pip / point|Tamanho de 1 pip / ponto
Tamaño mínimo de tick|Minimum tick size|Tamanho mínimo do tick
Moneda cotizada|Quote currency|Moeda cotada
Paso de lotaje|Lot step|Passo de lote
Lote mínimo|Minimum lot|Lote mínimo
Lote máximo|Maximum lot|Lote máximo
Costo de ida y vuelta / lote (USD)|Round-trip cost / lot (USD)|Custo de ida e volta / lote (USD)
Comisión total por apertura y cierre.|Total commission for opening and closing.|Comissão total de abertura e fechamento.
Costo fijo total (USD)|Total fixed cost (USD)|Custo fixo total (USD)
Se suma una vez a la posición.|Added once to the position.|Somado uma vez à posição.
Guardar instrumento para esta cuenta|Save instrument for this account|Salvar instrumento para esta conta
Configuración editable: pulsá Guardar instrumento para conservar los cambios. Los precios y conversiones no se guardan.|Editable setup: tap Save instrument to keep changes. Prices and conversions are not saved.|Configuração editável: toque em Salvar instrumento para manter as alterações. Preços e conversões não são salvos.
Dónde consultar las especificaciones ↗|Where to check the specifications ↗|Onde consultar as especificações ↗
Guardar esta regla de riesgo|Save this risk rule|Salvar esta regra de risco
Podés guardar el porcentaje o importe para esta cuenta. No modifica las reglas de la firma.|You can save the percentage or amount for this account. It doesn't change the firm's rules.|Você pode salvar o percentual ou valor para esta conta. Não altera as regras da empresa.
Cómo se calcula|How it's calculated|Como é calculado
Riesgo disponible ÷ pérdida por lote al stop. Se incluyen los costos ingresados y se redondea hacia abajo al paso permitido.|Available risk ÷ loss per lot at the stop. Entered costs are included and it rounds down to the allowed step.|Risco disponível ÷ perda por lote no stop. Os custos informados são incluídos e arredonda para baixo ao passo permitido.
Precios y conversiones manuales. Usá coma o punto decimal, sin separadores de miles. Resultado según los datos ingresados. No incluye swaps ni deslizamiento; los costos adicionales deben ingresarse.|Manual prices and conversions. Use a comma or dot as decimal, no thousands separators. Result based on the data entered. Excludes swaps and slippage; extra costs must be entered.|Preços e conversões manuais. Use vírgula ou ponto decimal, sem separadores de milhar. Resultado conforme os dados informados. Não inclui swaps nem slippage; custos adicionais devem ser informados.
Calculadoras|Calculators|Calculadoras
Ej.: Mi bróker · MT5|E.g. My broker · MT5|Ex.: Minha corretora · MT5
Este nombre aparece en el saludo y el perfil de tu diario.|This name appears in the greeting and your journal profile.|Este nome aparece na saudação e no perfil do seu diário.
Hay cambios diferentes en este dispositivo y en la nube. Tus cambios locales siguen conservados.|This device and the cloud have different changes. Your local changes are still kept.|Há alterações diferentes neste dispositivo e na nuvem. Suas alterações locais continuam guardadas.
Si hay un conflicto, compará las versiones antes de elegir. Las copias de protección se guardan en este navegador para tu usuario; descargalas para conservarlas fuera del dispositivo.|If there's a conflict, compare the versions before choosing. Safety copies are saved in this browser for your user; download them to keep them off the device.|Se houver conflito, compare as versões antes de escolher. As cópias de proteção ficam neste navegador para o seu usuário; baixe-as para guardá-las fora do dispositivo.
Copias de protección en este dispositivo|Safety copies on this device|Cópias de proteção neste dispositivo
Agregá un código de Google Authenticator para proteger tu cuenta, incluso si entrás con Google.|Add a Google Authenticator code to protect your account, even if you sign in with Google.|Adicione um código do Google Authenticator para proteger sua conta, mesmo se entrar com o Google.
Activación opcional. El código se solicita al iniciar una nueva sesión; no necesitás ingresarlo cada vez que abrís la app con una sesión ya verificada.|Optional. The code is requested when you start a new session; you don't need to enter it every time you open the app with an already verified session.|Ativação opcional. O código é solicitado ao iniciar uma nova sessão; você não precisa informá-lo sempre que abrir o app com uma sessão já verificada.
Desactivar verificación|Turn off verification|Desativar verificação
Forex · registro anterior|Forex · earlier record|Forex · registro anterior
Otro activo / par|Other asset / pair|Outro ativo / par
Nombre del activo|Asset name|Nome do ativo
Guardar operación|Save trade|Salvar operação
Cerrar ventana|Close window|Fechar janela
Ej.: EURUSD.a|E.g. EURUSD.a|Ex.: EURUSD.a
Operaciones del día|Trades of the day|Operações do dia
Empresa|Firm|Empresa
Personalizada / otra|Custom / other|Personalizada / outra
Programa|Program|Programa
Tamaño (USD)|Size (USD)|Tamanho (USD)
Versión de reglas|Rules version|Versão das regras
Variante del contrato|Contract variant|Variante do contrato
Ciclo de retiro elegido|Chosen withdrawal cycle|Ciclo de saque escolhido
Hora del servidor (confirmar dashboard)|Server time (check dashboard)|Horário do servidor (confirmar no dashboard)
Nombre opcional|Optional name|Nome opcional
Complemento sin días mínimos|No-minimum-days add-on|Complemento sem dias mínimos
Lite: complemento pérdida máxima 10%|Lite: 10% max loss add-on|Lite: complemento perda máxima 10%
Complemento Swing|Swing add-on|Complemento Swing
Cantidad de fases|Number of phases|Quantidade de fases
Firma|Firm|Empresa
Capital ($)|Capital ($)|Capital ($)
Objetivo Fase 1 (%)|Phase 1 target (%)|Meta Fase 1 (%)
Objetivo Fase 2 (%)|Phase 2 target (%)|Meta Fase 2 (%)
Pérdida diaria (%)|Daily loss (%)|Perda diária (%)
Pérdida máxima (%)|Max loss (%)|Perda máxima (%)
Riesgo máximo (%)|Max risk (%)|Risco máximo (%)
Confirmé tamaño, versión y variante contra mi contrato o dashboard.|I confirmed size, version and variant against my contract or dashboard.|Confirmei tamanho, versão e variante com meu contrato ou dashboard.
Ej. Mi cuenta principal|E.g. My main account|Ex. Minha conta principal
Ej. FundingPips|E.g. FundingPips|Ex. FundingPips
💎 PA / Retiros|💎 PA / Withdrawals|💎 PA / Saques
Esta sección se habilita cuando la cuenta pasa a PA / Funded.|This section unlocks when the account moves to PA / Funded.|Esta seção é liberada quando a conta passa para PA / Funded.
Meta mensual|Monthly goal|Meta mensal
Ganancia del mes|Profit this month|Lucro do mês
Retirado|Withdrawn|Sacado
Falta para meta|Left to goal|Falta para a meta
La meta mide la ganancia generada durante el mes. Los retiros se registran por separado y no reducen el progreso de la meta.|The goal measures profit made during the month. Withdrawals are recorded separately and don't reduce goal progress.|A meta mede o lucro gerado durante o mês. Os saques são registrados à parte e não reduzem o progresso da meta.
Editar meta|Edit goal|Editar meta
Meta de ganancia (%)|Profit goal (%)|Meta de lucro (%)
Mes|Month|Mês
💸 Retiros de esta cuenta|💸 Withdrawals from this account|💸 Saques desta conta
Todavía no hay retiros registrados en este mes.|No withdrawals recorded this month yet.|Ainda não há saques registrados neste mês.
💸 Registrar retiro|💸 Record withdrawal|💸 Registrar saque
Monto del retiro (USD)|Withdrawal amount (USD)|Valor do saque (USD)
Nota opcional|Optional note|Nota opcional
Descuento del balance de trading (USD)|Trading balance deduction (USD)|Desconto do saldo de trading (USD)
Si lo dejás vacío, se descuenta el importe recibido. Si la firma descontó un monto bruto distinto, ingresalo aquí. Un 0 indica que no hubo descuento.|If left empty, the amount received is deducted. If the firm deducted a different gross amount, enter it here. A 0 means nothing was deducted.|Se deixar vazio, é descontado o valor recebido. Se a empresa descontou um valor bruto diferente, informe-o aqui. Um 0 indica que não houve desconto.
Recibí una nueva cuenta FTMO 1-Step después de este retiro (reiniciar piso de riesgo).|I received a new FTMO 1-Step account after this withdrawal (reset risk floor).|Recebi uma nova conta FTMO 1-Step depois deste saque (reiniciar piso de risco).
Guardar retiro|Save withdrawal|Salvar saque
Ej. Primer payout|E.g. First payout|Ex. Primeiro payout
Vacío = el mismo importe recibido|Empty = same amount received|Vazio = o mesmo valor recebido
Cerrar detalle|Close details|Fechar detalhes
Cerrar aviso|Close notice|Fechar aviso
Elegí una cuenta para consultar sus datos individuales. Las cuentas se conservan por separado.|Choose an account to see its own data. Accounts are kept separately.|Escolha uma conta para consultar seus dados individuais. As contas são mantidas separadamente.
Seleccionar sin grupo y sin registros|Select ungrouped with no records|Selecionar sem grupo e sem registros
EURUSD, Nasdaq, oro…|EURUSD, Nasdaq, gold…|EURUSD, Nasdaq, ouro…
Diario de trading para cuentas de fondeo|Trading journal for funded accounts|Diário de trading para contas de financiamento
Operá tu challenge sabiendo exactamente cuánto podés arriesgar.|Trade your challenge knowing exactly how much you can risk.|Opere seu challenge sabendo exatamente quanto pode arriscar.
Registrá tus operaciones y JourFund calcula al instante tu margen de pérdida, tu avance hacia el objetivo y tus condiciones de retiro, con las reglas de tu firma.|Log your trades and JourFund instantly works out your loss allowance, your progress to target and your withdrawal conditions, using your firm's rules.|Registre suas operações e o JourFund calcula na hora sua margem de perda, seu avanço até a meta e suas condições de saque, com as regras da sua empresa.
Ya tengo cuenta|I already have an account|Já tenho conta
Las reglas de tu firma, ya cargadas|Your firm's rules, preloaded|As regras da sua empresa, já carregadas
FTMO, FundedNext y FundingPips con pérdida diaria, pérdida máxima, objetivos y días mínimos. Para otras firmas, configurás las reglas de tu contrato.|FTMO, FundedNext and FundingPips with daily loss, max loss, targets and minimum days. For other firms, you set your contract's rules.|FTMO, FundedNext e FundingPips com perda diária, perda máxima, metas e dias mínimos. Para outras empresas, você configura as regras do seu contrato.
Tu riesgo, siempre a la vista|Your risk, always in view|Seu risco, sempre à vista
Cuánto podés perder hoy, cuánto te queda en total y cuánto falta para pasar de fase, con avisos al 70 %, 90 % y al límite.|How much you can lose today, how much is left overall and how far you are from passing the phase, with alerts at 70%, 90% and the limit.|Quanto você pode perder hoje, quanto resta no total e quanto falta para passar de fase, com avisos em 70%, 90% e no limite.
El tamaño de posición según tu stop y el riesgo que elegís, con el balance de la cuenta.|Position size from your stop and the risk you choose, using the account balance.|O tamanho da posição conforme seu stop e o risco escolhido, com o saldo da conta.
Sesiones y noticias|Sessions and news|Sessões e notícias
Horarios de cada mercado, agenda económica de Forex Factory y gráficos de TradingView.|Market hours, the Forex Factory economic calendar and TradingView charts.|Horários de cada mercado, agenda econômica da Forex Factory e gráficos do TradingView.
Estadísticas y retiros|Statistics and withdrawals|Estatísticas e saques
Win rate, drawdown, evolución del balance e historial de retiros de tus cuentas financiadas.|Win rate, drawdown, balance over time and withdrawal history for your funded accounts.|Win rate, drawdown, evolução do saldo e histórico de saques das suas contas financiadas.
En todos tus dispositivos|On all your devices|Em todos os seus dispositivos
Tu diario se sincroniza en la nube. Instalalo en el celular como una app.|Your journal syncs to the cloud. Install it on your phone like an app.|Seu diário sincroniza na nuvem. Instale no celular como um app.
JourFund no está afiliado a ninguna firma de fondeo. Las reglas son una referencia: tu contrato y el dashboard de tu firma siempre mandan.|JourFund is not affiliated with any prop firm. Rules are a reference: your contract and your firm's dashboard always prevail.|O JourFund não é afiliado a nenhuma empresa de financiamento. As regras são uma referência: seu contrato e o dashboard da sua empresa sempre prevalecem.
¿Qué es JourFund?|What is JourFund?|O que é o JourFund?`;
const uppercase=new Map();
for(const row of rows.split('\n')){const [es,en,pt]=row.split('|');dictionary.set(es,{es,en,'pt-BR':pt});uppercase.set(es.toUpperCase(),es);}
let language='es',selected='es',editorUser=null,lastButton=null;
const sources=new WeakMap(), attributes=new WeakMap();
// These nodes contain user content, not application copy. Values and third-party embeds are never modified.
const protectedSelector='script,style,textarea,iframe,code,pre,[contenteditable],#ft59ProfileName,#ft59GreetingName,#ft94Name,#ft94Email,#ftCloudUser,#ft59DisplayName,#ft70Note,.ft70-nickname,.ft94-identity,.ft-account-choice strong,.day-trade-meta,.withdraw-date,.ft62-item strong,.ft62-item p,#ft64AlertList strong,[data-i18n-ignore]';
function translate(text){
 if(language==='es')return text;
 if(dictionary.has(text))return dictionary.get(text)[language];
 const sync=/^Sincronizado hace (\d+) (min|h|días?)$/.exec(text);
 if(sync)return language==='en'?'Synced '+sync[1]+' '+({min:'min',h:'h',día:'day',días:'days'}[sync[2]])+' ago':'Sincronizado há '+sync[1]+' '+sync[2];
 const count=/^(\d+) (operación|operaciones|cuenta|cuentas|día|días)( registrada| registradas)?$/.exec(text);
 if(count){const noun=language==='en'?{operación:'trade',operaciones:'trades',cuenta:'account',cuentas:'accounts',día:'day',días:'days'}:{operación:'operação',operaciones:'operações',cuenta:'conta',cuentas:'contas',día:'dia',días:'dias'};return count[1]+' '+noun[count[2]]+(count[3]?(language==='en'?' recorded':Number(count[1])===1?' registrada':' registradas'):'');}
 const en=language==='en',patterns=[
  [/^(Abre|Cierra) en (.+)$/,m=>(en?(m[1]==='Abre'?'Opens in ':'Closes in '):(m[1]==='Abre'?'Abre em ':'Fecha em '))+m[2]],
  [/^Diaria: (.+) · Máxima: (.+)$/,m=>(en?'Daily: ':'Diária: ')+m[1]+(en?' · Max: ':' · Máxima: ')+m[2]],
  [/^(\d+) registradas?$/,m=>m[1]+(en?' recorded':Number(m[1])===1?' registrada':' registradas')],
  [/^Faltan (.+) para el objetivo$/,m=>en?m[1]+' to go to target':'Faltam '+m[1]+' para a meta'],
  [/^Última actividad: (.+)$/,m=>(en?'Last activity: ':'Última atividade: ')+m[1]],
  [/^(\d+) (cuentas?) · Balance (.+)$/,m=>m[1]+(en?(m[2]==='cuenta'?' account':' accounts')+' · Balance ':(m[2]==='cuenta'?' conta':' contas')+' · Saldo ')+m[3]],
  [/^Abrir notificaciones \((\d+) sin leer\)$/,m=>en?'Open notifications ('+m[1]+' unread)':'Abrir notificações ('+m[1]+' não lidas)'],
  [/^Fin de semana Forex · Próxima apertura: (.+) · en (.+)$/,m=>en?'Forex weekend · Next open: '+m[1]+' · in '+m[2]:'Fim de semana Forex · Próxima abertura: '+m[1]+' · em '+m[2]],
  [/^Actualizado (.+) · Horarios aproximados$/,m=>(en?'Updated ':'Atualizado ')+m[1]+(en?' · Approximate times':' · Horários aproximados')],
  [/^Objetivos · Fase (\d+) de (\d+)$/,m=>en?'Targets · Phase '+m[1]+' of '+m[2]:'Metas · Fase '+m[1]+' de '+m[2]],
  [/^Fechas según el servidor de esta cuenta \((.+)\)\.$/,m=>en?'Dates follow this account\'s server ('+m[1]+').':'Datas conforme o servidor desta conta ('+m[1]+').'],
  [/^Se activan al completar las (\d+) fase\(s\)\. Podés consultar la etapa financiada en Cuentas\.$/,m=>en?'They unlock after completing '+m[1]+' phase(s). You can check the funded stage in Accounts.':'São ativadas ao concluir '+m[1]+' fase(s). Você pode consultar a etapa financiada em Contas.'],
  [/^Caída desde el máximo registrado de esta etapa\. Máximo histórico: (.+)$/,m=>en?'Drop from this stage\'s recorded peak. All-time high: '+m[1]:'Queda desde o máximo registrado desta etapa. Máximo histórico: '+m[1]],
  [/^Piso de pérdida: (.+) · Equity de referencia: (.+)$/,m=>en?'Loss floor: '+m[1]+' · Reference equity: '+m[2]:'Piso de perda: '+m[1]+' · Equity de referência: '+m[2]],
  [/^Este dispositivo · (.+)$/,m=>(en?'This device · ':'Este dispositivo · ')+m[1]],
  [/^Cuenta y sincronización · (.+)$/,m=>(en?'Account and sync · ':'Conta e sincronização · ')+m[1]],
  [/^Revisado (.+) · Reglas consultadas (.+)$/,m=>en?'Reviewed '+m[1]+' · Rules checked '+m[2]:'Revisado '+m[1]+' · Regras consultadas '+m[2]],
  [/^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{4})$/,m=>{const i=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'].indexOf(m[1]);return new Intl.DateTimeFormat(en?'en-US':'pt-BR',{month:'long',year:'numeric',timeZone:'UTC'}).format(Date.UTC(+m[2],i,1));}]];
 for(const [re,fn] of patterns){const m=re.exec(text);if(m)return fn(m);}
 const upper=uppercase.get(text);if(upper)return dictionary.get(upper)[language].toUpperCase();
 return text;
}
function textNode(node){const p=node.parentElement;if(!p||p.closest(protectedSelector)||p.closest('td')&&!p.closest('button'))return;let item=sources.get(node);if(!item||node.nodeValue!==item.output)item={source:node.nodeValue};const trimmed=item.source.trim(),translated=translate(trimmed);item.output=item.source.replace(trimmed,translated);if(node.nodeValue!==item.output)node.nodeValue=item.output;sources.set(node,item);}
function scan(root){if(root.nodeType===3){textNode(root);return;}if(root.nodeType!==1||root.matches(protectedSelector)||root.closest(protectedSelector))return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())textNode(n);for(const element of [root,...root.querySelectorAll('[placeholder],[aria-label],[title]')]){if(element.closest(protectedSelector))continue;let cache=attributes.get(element)||{};for(const attr of ['placeholder','aria-label','title']){if(!element.hasAttribute(attr))continue;const current=element.getAttribute(attr);let state=cache[attr];if(!state||current!==state.output)state={source:current};state.output=translate(state.source);if(current!==state.output)element.setAttribute(attr,state.output);cache[attr]=state;}attributes.set(element,cache);}}
const observer=new MutationObserver(records=>{observer.disconnect();for(const record of records){if(record.type==='characterData')scan(record.target);else if(record.type==='attributes')scan(record.target);else record.addedNodes.forEach(scan);}observe();});
function observe(){if(typeof document==='undefined'||!document.body)return;observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});}
function apply(code){language=supported.includes(code)?code:'es';document.documentElement.lang=language;observer.disconnect();scan(document.body);document.getElementById('jfLanguageCurrent').textContent=names[language];observe();window.dispatchEvent(new CustomEvent('jfLanguageChanged',{detail:{language}}));}
const preferences=document.getElementById('ft61ConfigureAccount')?.closest('section');if(!preferences)return;
const old=preferences.querySelector('p');if(old?.textContent.includes('Idioma:'))old.remove();
const button=document.createElement('button');button.type='button';button.id='jfLanguageButton';button.className='jf-language-row';button.innerHTML='<span aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18"/></svg></span><span><strong>Idioma de la aplicación</strong><small id="jfLanguageCurrent">Español</small></span><span aria-hidden="true">›</span>';preferences.querySelector('h3').after(button);
const dialog=document.createElement('dialog');dialog.id='jfLanguageDialog';dialog.className='jf-language-dialog';dialog.innerHTML='<form method="dialog"><header><h2>Cambiar idioma</h2><button type="button" class="jf-language-close" aria-label="Cerrar">×</button></header><p class="sub">Podés cambiarlo cuando quieras.</p><fieldset><legend class="jf-language-sr">Idioma de la aplicación</legend>'+supported.map(code=>'<label class="jf-language-option" data-code="'+code+'"><span data-i18n-ignore><strong>'+names[code]+'</strong><small>'+({es:'Spanish',en:'Inglés','pt-BR':'Portugués de Brasil'}[code])+'</small></span><input type="radio" name="language" value="'+code+'"></label>').join('')+'</fieldset><p class="sub" id="jfLanguageError" role="alert"></p><button type="submit" class="btn jf-language-apply">Aplicar idioma</button></form>';document.body.append(dialog);
function close(){dialog.close();lastButton?.focus();}
button.onclick=()=>{lastButton=button;editorUser=window.ftCloudSession?.user?.id||null;selected=language;dialog.querySelector('[value="'+selected+'"]').checked=true;dialog.querySelector('#jfLanguageError').textContent='';dialog.showModal();};dialog.querySelector('.jf-language-close').onclick=close;
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
dialog.addEventListener('change',e=>{if(e.target.name==='language')selected=e.target.value;});
dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const error=dialog.querySelector('#jfLanguageError');try{const user=window.ftCloudSession?.user?.id||null;if(user!==editorUser)throw Error('La sesión cambió.');if(user){const cloud=window.ftProtectionCloud,state=cloud.snapshot();const timestamp=new Date().toISOString();const candidate=state.accounts.map(a=>({...a,preferences:{...a.preferences,language:selected,languageChangedAt:timestamp}}));cloud.commit(candidate,state);}else{localStorage.setItem('jourfund_login_language',selected);}apply(selected);close();}catch(ex){error.textContent=translate(ex.message);}};
function refresh(){const user=window.ftCloudSession?.user?.id||null;if(dialog.open&&user!==editorUser)close();if(user){try{const state=window.ftProtectionCloud.snapshot();const preference=state.accounts.map(a=>a.preferences).filter(p=>supported.includes(p?.language)).sort((a,b)=>(Date.parse(b.languageChangedAt)||0)-(Date.parse(a.languageChangedAt)||0))[0];const next=preference?.language||'es';if(next!==language)apply(next);}catch{/* Data not ready: do not write or replace a pending preference. */}}else{let next='es';try{next=localStorage.getItem('jourfund_login_language')||'es';}catch{}if(next!==language)apply(next);}}
window.addEventListener('pagehide',()=>observer.disconnect());window.addEventListener('pageshow',observe);
window.JourFundI18n={t:translate,get language(){return language;},refresh};window.addEventListener('ft67SyncStatus',refresh);apply('es');refresh();
// Locale for Intl/toLocale* calls; undefined in Spanish so each call keeps its own es-* format.
window.jfLocale=()=>({en:'en-US','pt-BR':'pt-BR'})[language];
window.addEventListener('jfLanguageChanged',()=>{if(document.body.classList.contains('ft-ready'))window.render?.();});
})();
