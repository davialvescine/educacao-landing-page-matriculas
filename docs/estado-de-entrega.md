# Site de Matrículas 2027: estado de entrega

*Apurado no código em 04 de setembro de 2026, contra a proposta comercial enviada em 02/09/2026. Os valores são os da proposta e não foram alterados.*

De **R$ 34.140** de implantação, **R$ 28.800 já estão no ar**: **R$ 23.550** sem ressalva e **R$ 5.250** com um pedaço nomeado faltando. **R$ 5.340** ainda não começaram.

| Estado | Valor | O que significa |
| --- | --- | --- |
| ✅ Pronto | R$ 23.550 | Construído, no ar e funcionando como está descrito. |
| ⚠️ Parcial | R$ 5.250 | Já funciona, mas falta o pedaço nomeado na linha. |
| ❌ Falta | R$ 5.340 | Não foi construído. |

## O que ainda não está no ar

Cada linha aparece detalhada no grupo dela. Aqui estão juntas, com o que trava cada uma — porque boa parte do que falta não depende de escrever código.

| Item | Estado | O que trava | Valor |
| --- | --- | --- | --- |
| § 02 Página do IABC | ❌ Falta | **Depende de construir.** Rota, conteúdo do internato e agendamento de visita. | R$ 1.300 |
| § 04 Motor do relatório mensal | ❌ Falta | **Depende de construir.** O cruzamento por região, escola, série e campanha. | R$ 1.100 |
| § 04 Envio automático por e-mail | ❌ Falta | **Depende de construir.** PDF por região e a tarefa do primeiro dia útil. | R$ 600 |
| § 02 Página do Dica Plus | ❌ Falta | **Esperando a rede.** Falta o layout que a rede vai desenhar. | R$ 1.300 |
| § 05 Dica Plus: integração | ❌ Falta | **Esperando a rede.** Falta a documentação da API da plataforma. | R$ 790 |
| § 06 Search Console e Core Web Vitals | ❌ Falta | **Esperando a publicação.** Só começa com o site no domínio da rede. | R$ 250 |
| § 04 Trilha de auditoria de acesso | ⚠️ Parcial | **Depende de construir.** Registrar entrada e tentativa de entrada no painel. | R$ 250 |
| § 07 Consentimento registrado e comprovável | ⚠️ Parcial | **Depende de construir.** Gravar data, hora e versão do texto aceito. | R$ 250 |
| § 06 Identidade da rede nos buscadores de IA | ⚠️ Parcial | **Esperando a rede.** Faltam o Facebook e o YouTube oficiais. | R$ 550 |
| § 08 Infraestrutura de produção | ⚠️ Parcial | **Esperando a publicação.** Falta servidor e domínio contratados. | R$ 400 |
| § 08 Documentação e treinamento | ⚠️ Parcial | **Esperando a rede.** Falta agendar o repasse com as coordenações. | R$ 250 |
| § 08 QA e homologação | ⚠️ Parcial | **Esperando a publicação.** Falta o ambiente separado, que vem com o servidor. | R$ 250 |
| § 11 Landing page do projeto | ⚠️ Parcial | **Esperando a rede.** Falta o briefing e a identidade da landing. | R$ 3.300 |

## § 01 — Página principal e estrutura

*✅ Pronto R$ 6.550*

### ✅ Pronto — Página principal · R$ 5.900

Doze seções, nesta ordem: hero da campanha, tarja de destaques, rede mundial, mapa das regiões, níveis de ensino, diferenciais, um dia na escola, o mundo, depoimentos, IABC, perguntas frequentes e formulário de matrícula. Os fundos alternam entre dourado, navy e creme para que nenhum bloco pareça gêmeo do vizinho.

> **Estado atual.** As doze seções estão no ar, na ordem prevista.

### ✅ Pronto — Páginas de apoio · R$ 150

Confirmação pós-cadastro com o WhatsApp da região, página de erro e arte de compartilhamento.

> **Estado atual.** Confirmação com o WhatsApp da região, página de erro e a arte de compartilhamento — um card 1200×630 gerado no build, na identidade da campanha, herdado por todas as 46 rotas.

### ✅ Pronto — Responsivo para celular · sem custo

A maior parte das famílias vai chegar pelo celular, vindo de um link no WhatsApp ou de uma busca no Google. Por isso o site inteiro é pensado primeiro para a tela pequena: formulário em duas etapas que se preenche com o polegar, barra fixa de ação no rodapé com o WhatsApp da região a um toque, mapa das regiões em versão leve, imagens que carregam no tamanho certo para a conexão, e todas as 46 páginas testadas em iPhone e Android. **O ganho:** a família que abre o link no ônibus consegue pedir contato em menos de um minuto, sem dar zoom e sem esperar carregar.

> **Estado atual.** Formulário em duas etapas, barra fixa de ação, imagens dimensionadas e preferência de menos movimento respeitada.

### ✅ Pronto — Componentes e acessibilidade · R$ 500

Biblioteca de interface reaproveitada em todas as rotas, foco visível, contraste conferido, navegação por teclado e respeito à preferência de menos movimento. **O ganho:** o site funciona para quem usa leitor de tela ou tem baixa visão, o que é obrigação de escola, e páginas construídas com os mesmos componentes ficam consistentes e mais rápidas de evoluir.

> **Estado atual.** Biblioteca de interface reaproveitada nas 46 rotas, com foco visível e navegação por teclado.


## § 02 — Páginas por região, IABC e Dica Plus

*✅ Pronto R$ 4.500 · ❌ Falta R$ 2.600*

### ✅ Pronto — Página por região · R$ 900 × 5

Um modelo de página de região, alimentado pelos dados de cada estado: DF, GO, MS, Mato Grosso e TO. Cada uma lista as unidades da própria região e atende pelo WhatsApp da associação responsável. No Mato Grosso, o lead vai para a associação certa, Leste ou Oeste, pelo município escolhido, sem que a família precise saber dessa divisão. **SEO incluso:** título e descrição da região, endereço canônico e a lista estruturada `ItemList`. **AEO incluso:** perguntas e respostas da região marcadas em `FAQPage`. **GEO incluso:** a praça acompanhada nos buscadores de IA. **O ganho:** é a porta de entrada da família que ainda está escolhendo a cidade. Região nova entra pelo mesmo modelo, só com os dados dela.

> **Estado atual.** Cinco rotas no ar, como orçado: o Mato Grosso virou **uma página só**, e a divisão entre ALM e AOM ficou por dentro — o lead nasce na associação certa, decidida pela escola escolhida. SEO: título, descrição, canônico e `ItemList`. AEO: `FAQPage` com cinco perguntas por região. Trilha `BreadcrumbList` incluída.

### ❌ Falta — Página do IABC · R$ 1.300

Rota própria para o internato, separada das 39 escolas de bairro: custo total de mensalidade somada a moradia, rotina, segurança, galeria do campus e agendamento de visita. A família do IABC pesquisa de outro estado e quer ver o lugar antes de decidir. É uma jornada de compra distinta, e uma página própria capta quem hoje se perde entre as escolas de bairro. **SEO, AEO e GEO inclusos:** a busca por internato adventista passa a encontrar o campus, e não a home da rede; as perguntas do internato (custo, rotina, idade mínima, como visitar) entram marcadas em `FAQPage`; e o campus passa a ser acompanhado nos buscadores de IA, que é onde a família de outro estado começa a procurar.

> **Estado atual.** Existe a seção do internato na home, com captação própria. A rota separada, com custo total, rotina, galeria e agendamento de visita, não foi construída.

### ❌ Falta — Página do Dica Plus · R$ 1.300

Rota própria de apresentação e captação, com formulário ligado à plataforma. Implementação a partir do layout que vocês desenharem.

> **Estado atual.** Não iniciada: depende do layout que a rede vai desenhar.


## § 03 — Captação de leads

*✅ Pronto R$ 1.200*

### ✅ Pronto — Formulário em duas etapas · R$ 400

Valida nome, WhatsApp com DDD, região, escola e nível. Divide a fricção em dois passos para elevar a conclusão.

> **Estado atual.** Duas etapas, validação de DDD e trava contra envio duplicado.

### ✅ Pronto — API de leads e banco · R$ 400

O lead é gravado antes de sair para o CRM: se a integração cair, nenhuma família se perde.

> **Estado atual.** O lead é gravado no banco antes de sair para o CRM.

### ✅ Pronto — Rastreio de campanha · R$ 200

Captura de utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid e fbclid, ligando cada matrícula ao anúncio que a trouxe.

> **Estado atual.** Os sete parâmetros capturados na chegada e anexados ao lead.

### ✅ Pronto — WhatsApp por região e barra mobile · R$ 200

Chat flutuante que troca o número conforme a página aberta, e barra de ação fixa no celular.

> **Estado atual.** O número troca conforme a página aberta; barra fixa no celular.


## § 04 — Painel administrativo

*✅ Pronto R$ 2.950 · ⚠️ Parcial R$ 250 · ❌ Falta R$ 1.700*

### ✅ Pronto — Autenticação · R$ 650

Login por e-mail e senha, sessões assinadas, cadastro público bloqueado e recuperação de senha por e-mail com link de uso único válido por uma hora.

> **Estado atual.** Better Auth com sessões assinadas, cadastro público bloqueado e recuperação de senha por e-mail.

### ✅ Pronto — Papéis e recorte por região · R$ 500

Administrador vê tudo; coordenador vê apenas as regiões atribuídas, e o recorte vale igualmente na exportação e no reenvio, não só na tela.

> **Estado atual.** O recorte por região vale na tela, na exportação e no reenvio.

### ✅ Pronto — Tela de leads · R$ 750

Resumo, filtros, detalhe em modal, status de envio ao CRM e status de atendimento devolvido pelo webhook.

> **Estado atual.** Resumo, filtros, detalhe em modal e os dois status por lead.

### ✅ Pronto — Exportação em CSV · R$ 200

Respeita as regiões de quem exporta e fica registrada na trilha de auditoria.

> **Estado atual.** Respeita as regiões de quem exporta e fica registrada.

### ✅ Pronto — Reenvio ao CRM · R$ 400

Ação manual no painel: botão de reenvio por lead e reprocesso em lote de pendentes e falhas, para a coordenação resolver na hora, sem abrir chamado técnico.

> **Estado atual.** Botão por lead e reprocesso em lote de pendentes e falhas.

### ✅ Pronto — Gestão de equipe · R$ 450

Criar e editar pessoas, atribuir regiões e cortar o acesso na hora, sem esperar a sessão expirar.

> **Estado atual.** Criação, edição, atribuição de regiões e corte de acesso imediato.

### ⚠️ Parcial — Trilha de auditoria de acesso · R$ 250

Registro de login, exportação, reenvio e alterações de equipe: quem viu o dado da família, quando e de onde. Identificadores internos mascarados.

> **Estado atual.** Grava exportação, reenvio e alterações de equipe, com o identificador interno mascarado. Falta gravar entrada e tentativa de entrada no painel.

### ❌ Falta — Motor do relatório mensal · R$ 1.100

Não é uma tela, é o cruzamento por trás dela: lê a base de leads, agrupa por região, escola e série pretendida, separa por origem de campanha, compara com o mês anterior e traz de volta do CRM quem foi atendido e quem ficou esperando. **Por que vale o valor:** o número que interessa não é quantos leads chegaram. É **quais escolas recebem lead e não respondem**, qual associação converte melhor e qual campanha trouxe matrícula em vez de curiosidade. Esse cruzamento é o que transforma o painel de uma lista de contatos em instrumento de gestão da rede. **A alternativa** é alguém exportar CSV e montar a planilha à mão toda virada de mês, para seis coordenações, todo mês, para sempre. E planilha feita à mão diverge, atrasa e ninguém confia nela na hora de decidir.

> **Estado atual.** Nenhum cruzamento construído: hoje a leitura por região, escola e série sai da exportação em CSV, montada à mão.

### ❌ Falta — Envio automático por e-mail · R$ 600

Uma tarefa agendada dispara no primeiro dia útil de cada mês, gera o PDF de cada região e envia por e-mail para a coordenação responsável. Cada associação recebe apenas o que é dela. **Inclui a configuração do envio:** servidor de e-mail autenticado com o domínio da rede, com `SPF` e `DKIM` assinados para o relatório não cair na caixa de spam; remetente institucional em vez de e-mail pessoal; corpo da mensagem com o resumo do mês já em texto, para quem lê no celular não precisar abrir anexo; PDF anexado; e registro de entrega: quem recebeu, quando, e se algum endereço recusou. O histórico fica guardado no painel, então qualquer mês anterior pode ser baixado sem pedir para ninguém. **O ganho:** relatório que depende de alguém lembrar de gerar não é lido: chega atrasado, ou não chega. Chegando sozinho na caixa de entrada no dia 1º, ele entra na pauta da reunião do mês.

> **Estado atual.** O envio de e-mail autenticado já existe e é usado na recuperação de senha. Falta o PDF por região, a tarefa do primeiro dia útil e o histórico no painel.


## § 05 — Integrações

*✅ Pronto R$ 1.400 · ❌ Falta R$ 790*

### ✅ Pronto — Sevenbee: envio do lead · R$ 550

Cria o contato com nome, telefone e e-mail, aplica etiquetas de campanha e região e anexa anotação. Não duplica contato: reconhece pelo telefone.

> **Estado atual.** Contato criado com etiquetas de campanha e região, sem duplicar pelo telefone.

### ✅ Pronto — Sevenbee: webhook de retorno · R$ 400

Três eventos de sessão viram o status de atendimento visível no painel: aguardando, em atendimento e atendido.

> **Estado atual.** Os três eventos de sessão são conferidos por segredo e viram status no painel.

### ✅ Pronto — Resiliência da integração · R$ 250

A parte automática: fila de falhas com nova tentativa a cada 10 minutos, sem ninguém precisar apertar nada, e webhook genérico de reserva caso a rede troque de CRM no futuro. É o que impede uma matrícula de se perder quando o CRM fica fora do ar.

> **Estado atual.** Fila de falhas com nova tentativa automática e webhook genérico de reserva.

### ✅ Pronto — Analytics e mídia paga · R$ 200

GA4 e Meta Pixel com eventos de conversão: geração de lead, clique no WhatsApp e contato.

> **Estado atual.** GA4 e Meta Pixel com os eventos de lead e de contato.

### ❌ Falta — Dica Plus: integração · R$ 790

Troca de dados com a plataforma de interação. Preço para API documentada com token; sem documentação sobe para R$ 13.700, e sem API nenhuma passa de R$ 16.000.

> **Estado atual.** Não iniciada: depende da documentação da API da plataforma.


## § 06 — Base técnica de busca

*✅ Pronto R$ 1.050 · ⚠️ Parcial R$ 550 · ❌ Falta R$ 250*

### ✅ Pronto — Base técnica de indexação · R$ 400

Construída uma vez, usada por todas as páginas: `sitemap.xml` e `robots.txt` gerados automaticamente, `Open Graph` padrão para o link chegar com foto e título no WhatsApp, a diretiva `max-image-preview:large`, o mecanismo de endereço canônico que cada rota preenche com a própria URL, e a marcação semântica de `h1`, `nav`, `main` e `article`. **O ganho:** é a fundação. Sem ela, nenhuma página ranqueia, por melhor que seja o texto, e o link compartilhado chega como uma URL seca.

> **Estado atual.** Sitemap e robots gerados, Open Graph, canônico por rota e marcação semântica.

### ✅ Pronto — Dados estruturados da instituição · R$ 250

Os esquemas que descrevem a rede como um todo, em `JSON-LD`: `EducationalOrganization` para a instituição, o catálogo geral de unidades e o mecanismo de trilha de navegação em `BreadcrumbList`, que todas as páginas usam. **O ganho:** o Google entende que são 46 páginas de uma mesma rede, e não 46 sites soltos, o que concentra autoridade em vez de dispersar.

> **Estado atual.** `EducationalOrganization` na home com o catálogo geral das 39 unidades penduradas na instituição, e `BreadcrumbList` nas 46 páginas — antes existia só nas de escola.

### ✅ Pronto — Respostas em destaque da página principal · R$ 400

As perguntas frequentes da home, marcadas em `FAQPage` com pares `Question` e `Answer`: as dúvidas gerais sobre a rede, matrícula, valores e proposta pedagógica, escritas no formato que o Google recorta como resposta. **O ganho:** a rede ocupa a **posição zero**, acima do primeiro resultado orgânico, inclusive acima dos concorrentes que pagam anúncio, e é o texto que o Google Assistente lê em voz alta quando alguém pergunta pelo celular.

> **Estado atual.** As perguntas da home marcadas em `FAQPage`.

### ⚠️ Parcial — Identidade da rede nos buscadores de IA · R$ 550

O trabalho de entidade, feito uma vez para a marca: `sameAs` apontando para os perfis oficiais, nome, endereço e telefone idênticos em todas as fontes que os modelos rastreiam, e a verificação inicial de como **ChatGPT, Gemini e Perplexity** respondem por escola adventista no Centro-Oeste. **O ganho:** boa parte das famílias já pergunta à IA antes de abrir o Google, e a IA responde com quem ela reconhece. Quem não é entidade reconhecível simplesmente não aparece, e não há anúncio que compre esse espaço.

> **Estado atual.** `sameAs` com o site institucional e o Instagram oficial (perfil conferido), link visível no rodapé de todas as páginas, e cada unidade apontando para o próprio site quando existe. Falta o Facebook e o YouTube, que a rede ainda não informou, e a verificação no ChatGPT, Gemini e Perplexity, que só começa com o site publicado.

### ❌ Falta — Search Console e Core Web Vitals · R$ 250

Configuração do `Google Search Console`, envio do sitemap, primeira auditoria de cobertura e indexação, e auditoria de `Core Web Vitals`: `LCP`, `INP` e `CLS`, com as correções iniciais. **O ganho:** é como saber se o trabalho funcionou. Mostra quais termos já trazem visita, quais páginas o Google recusou indexar e onde a rede perdeu posição. Sem isso, SEO vira fé.

> **Estado atual.** Depende do site publicado no domínio da rede.


## § 07 — LGPD: o que o sistema executa

*⚠️ Parcial R$ 250*

### ⚠️ Parcial — Consentimento registrado e comprovável · R$ 250

O aceite no formulário guarda data, hora e a versão exata do texto que a família leu. **O ganho:** se alguém questionar depois, existe prova de que houve consentimento e de **a quê** a pessoa consentiu. Sem esse registro, o aceite não vale como defesa.

> **Estado atual.** O aceite é obrigatório no formulário, mas **não é gravado**: não há data, hora nem versão do texto no banco. Como está, o aceite não serve de prova. É o item mais barato do orçamento e o de maior exposição.

### · Não contratado — Aviso de cookies que bloqueia antes do aceite · R$ 300

Banner que segura o Google Analytics e o Meta Pixel até a família aceitar, e guarda a escolha. **O ganho:** a maioria dos sites exibe o aviso mas dispara a medição assim que a página abre, o que anula o consentimento e é a irregularidade mais fácil de alguém apontar num site que capta dado de criança.

### · Não contratado — Prazo de guarda e descarte automático · R$ 500

Cada tipo de dado ganha um prazo, e uma rotina apaga a identificação do lead que não virou matrícula depois de encerrado o ciclo. **O ganho:** a lei exige guardar só enquanto a finalidade existir. Base antiga acumulada não é zelo: é risco, e é exatamente o que vaza.

### · Não contratado — Tela para atender pedidos das famílias · R$ 550

A lei dá à família o direito de pedir para ver, corrigir, exportar ou apagar os dados dela, e a rede é obrigada a atender. Esta tela deixa a coordenação buscar a família pelo telefone ou e-mail, ver tudo que está guardado e resolver na hora, com o atendimento ficando registrado. **O ganho:** sem ela, cada pedido vira chamado técnico e alguém precisa consultar o banco na mão. Com seis coordenações e milhares de contatos, um pedido esquecido vira reclamação na ANPD.


## § 08 — Infraestrutura e entrega

*⚠️ Parcial R$ 900*

### ⚠️ Parcial — Infraestrutura de produção · R$ 400

Container, servidor, apontamento de domínio, certificado, tarefas agendadas e rotina de backup do banco.

> **Estado atual.** Container, composição de serviços e guia de publicação prontos, com o espelho rodando localmente. Falta a subida no servidor da rede: domínio, certificado, tarefas agendadas e a rotina de backup do banco.

### ⚠️ Parcial — Documentação e treinamento · R$ 250

Manual do sistema, guia de publicação e repasse ao vivo para as coordenações das seis associações.

> **Estado atual.** Manual do sistema e guia de publicação escritos. Falta o repasse ao vivo às seis coordenações.

### ⚠️ Parcial — QA e homologação · R$ 250

Espelho idêntico da produção, com banco e servidor de e-mail próprios, para testar o fluxo ponta a ponta antes do lançamento, sem tocar em dado real de família.

> **Estado atual.** O espelho local em container roda o fluxo ponta a ponta. Falta o ambiente de homologação com banco e servidor de e-mail próprios.


## § 09 — Mensalidade

### · Começa na publicação — Suporte e manutenção · R$ 1.280 por mês

**R$ 1.280 por mês, valor único.** Manutenção de todas as páginas, suporte às landing pages e ao sistema. **Infraestrutura:** servidor dedicado com o banco de leads, certificado de segurança renovado sozinho, backup diário com 30 dias de retenção e monitoramento que avisa se o site cair. **Manutenção do sistema:** atualizações de segurança do framework e das bibliotecas, correção de defeitos e a operação da fila automática de reenvio ao CRM. **Manutenção das páginas:** as 46 páginas no ar e indexadas, com conferência dos dados de cada unidade ao longo do ano e as alterações que a rede pedir: telefone, endereço, WhatsApp, foto, nome de unidade, texto de seção, valores e datas de campanha, perguntas do FAQ. A rede pede, entra no ar, sem contar hora. **Resultado:** relatório mensal gerado e enviado por e-mail a cada coordenação no primeiro dia útil. **Busca:** acompanhamento mensal do Search Console, correção de indexação e acompanhamento de como os buscadores de IA respondem por escola adventista em cada praça. **Dados:** responder as famílias que pedirem para ver, corrigir ou apagar seus dados, e rodar o descarte no prazo. **Suporte:** às landing pages e ao painel, por e-mail e WhatsApp, em até 2 dias úteis. **Gestão dos dados:** WhatsApp das associações, dados das unidades e conteúdo das páginas mantidos pela coordenação no painel.

> **Estado atual.** Não é implantação: a mensalidade passa a contar quando o site for publicado.


## § 10 — Páginas por escola

*✅ Pronto R$ 5.900*

### ✅ Pronto — As 39 páginas de escola · R$ 5.900

Um único modelo de página, alimentado pelos dados de cada unidade: foto, endereço, telefone, WhatsApp da associação e o formulário já apontando para a escola certa. O que muda entre uma e outra é o dado, não o desenho, e por isso o conjunto tem um preço só. Cada uma nasce com título e descrição no nome da cidade, endereço canônico, ficha estruturada `School` com `PostalAddress`, perguntas da unidade em `FAQPage` e a cidade acompanhada nos buscadores de IA. **O ganho:** quando uma família pesquisa por escola cristã com o nome da cidade dela, é esta página que aparece, com a foto da unidade e o botão certo. São 39 endereços disputando, cada um, a busca do próprio município. Escola nova entra pelo mesmo modelo, só com os dados dela.

> **Estado atual.** As 39 páginas no ar com `School`, `PostalAddress`, trilha, canônico e `FAQPage` próprio. A descrição passou a usar a cidade real do endereço mais o bairro quando diferem — antes dizia a cidade errada em toda unidade batizada pelo bairro. O telefone segue em 4 das 39 fichas, dado que ainda vem da rede.


## § 11 — Landing page — projeto Educação dos Sonhos

*⚠️ Parcial R$ 3.300*

### ⚠️ Parcial — Landing page do projeto · R$ 3.300

Implementação da página, coleta de leads e envio ao Sevenbee com webhook de retorno (aguardando, em atendimento, atendido). A fila de resiliência com nova tentativa automática é a mesma do site principal, reaproveitada. Inclui a hospedagem do projeto.

> **Estado atual.** O projeto vai para repositório próprio, porque a identidade visual é outra e o único ponto em comum é o formulário. **O lado deste sistema está pronto:** rota `/api/leads/externo` autenticada por token, servidor-a-servidor, que grava antes de enviar, etiqueta o projeto no CRM e reprocessa pela fila; painel com filtro por site e coluna no CSV; contrato documentado. **Falta a landing em si** — depende do briefing e da identidade visual, e será construída fora deste repositório.


## Entregue além do escopo fechado

Não estava no orçamento e não entrou em nenhum subtotal: veio junto porque o resto já estava construído.

- **Suíte de testes automatizados.** 31 testes cobrindo as regras que quebram em silêncio: para qual associação o lead vai, qual WhatsApp cada unidade mostra, qual cidade a página anuncia, e de qual projeto o lead veio. Nada disso estoura erro ao falhar — só manda a família para a equipe errada.
- **Migração de banco com ensaio.** Um executor que mostra o que vai mudar antes de mudar, roda dentro de transação e desfaz tudo se algo falhar. Já exercitado num banco com leads dentro.
- **Mato Grosso como página única.** A família via duas regiões que só fazem sentido para a rede — Leste e Oeste são recorte administrativo. Agora é uma página com as 9 unidades; a divisão continua inteira no painel, e o lead nasce na associação certa pela escola escolhida. As rotas antigas respondem 301.
- **WhatsApp editável no painel.** Trocar um telefone exigia mexer no código e publicar. Agora o administrador edita e o número entra no ar sozinho, sem deploy: as páginas continuam estáticas e são regeneradas no salvamento. Verificado do banco até o HTML.
- **Cidade no formulário, e escola obrigatória.** A coordenação não sabia onde a família mora — só a região, que cobre um estado inteiro. A cidade agora viaja com o lead até o CRM e o e-mail. Em troca, quem ainda não escolheu a escola precisa escolher: troca conversão por qualificação.
- **E-mail de confirmação para a família.** Assim que o cadastro entra, quem informou e-mail recebe uma confirmação na identidade da rede, dizendo qual equipe vai chamar e com o botão do WhatsApp da região. O envio nunca derruba o cadastro: se o servidor de e-mail falhar, o lead já está salvo e segue para o CRM do mesmo jeito. O e-mail é campo opcional no formulário, então a confirmação só alcança quem preencheu.

## O que trava página já construída

Não é desenvolvimento: são dados que só a rede tem. Cada linha é uma página no ar, funcionando, mas incompleta até o dado chegar.

- WhatsApp regional da **ALM (Leste MT)** — sem ele a página da região fica sem botão de WhatsApp; o formulário continua funcionando.
- Confirmar o dígito dos WhatsApps de **MS** e do **Oeste MT**. O da ALM (Leste MT) deixou de ser bloqueio: dá para cadastrar pelo painel, sem depender de publicação.
- Telefone próprio de **35 das 39 escolas**, que hoje saem da ficha estruturada sem esse campo.
- Fotos próprias de **6 unidades**: Rondonópolis, Valparaíso, Porangatu, Goianiense, Sinop e Várzea Grande, que hoje reaproveitam foto de outra escola.

---

*Mesma apuração em PDF: `Matriculas-2027-Estado-de-Entrega.pdf`.*