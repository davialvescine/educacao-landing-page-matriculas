# Site de Matrículas 2027

*Orçamento · Educação Adventista Centro-Oeste*

**Escopo de implementação.** Cada entrega tem preço próprio, e os grupos podem ser contratados em etapas. Estado e escola são cobrados por página: dá para começar com menos regiões e crescer. Itens marcados como opcionais não entram nos subtotais. Estratégia, identidade, conteúdo e trabalho jurídico ficam com as equipes da própria união, e estão listados no § 11.

## Valores principais

- **Entrada: R$ 30.840** - pagamento único
- **Mensalidade: R$ 980** - site inteiro, manutenção e suporte
- **Páginas por escola: R$ 5.900** - 39 páginas, um modelo

## § 01 - Página principal e estrutura

A home da campanha e o que sustenta todas as rotas, num valor único.

### Página principal

`Pacote base`

Doze seções, nesta ordem: hero da campanha, tarja de destaques, rede mundial, mapa das regiões, níveis de ensino, diferenciais, um dia na escola, o mundo, depoimentos, IABC, perguntas frequentes e formulário de matrícula. Os fundos alternam entre dourado, navy e creme para que nenhum bloco pareça gêmeo do vizinho.

### Páginas de apoio

`Pacote base`

Confirmação pós-cadastro com o WhatsApp da região, página de erro e arte de compartilhamento.

### Responsivo para celular

`Brinde`

A maior parte das famílias vai chegar pelo celular, vindo de um link no WhatsApp ou de uma busca no Google. Por isso o site inteiro é pensado primeiro para a tela pequena: formulário em duas etapas que se preenche com o polegar, barra fixa de ação no rodapé com o WhatsApp da região a um toque, mapa das regiões em versão leve, imagens que carregam no tamanho certo para a conexão, e todas as 46 páginas testadas em iPhone e Android. **O ganho:** a família que abre o link no ônibus consegue pedir contato em menos de um minuto, sem dar zoom e sem esperar carregar.

### Componentes e acessibilidade

`Pacote base`

Biblioteca de interface reaproveitada em todas as rotas, foco visível, contraste conferido, navegação por teclado e respeito à preferência de menos movimento. **O ganho:** o site funciona para quem usa leitor de tela ou tem baixa visão, o que é obrigação de escola, e páginas construídas com os mesmos componentes ficam consistentes e mais rápidas de evoluir.

**Valor do grupo: R$ 6.550**

## § 02 - Páginas por região, IABC e Dica Plus

Cinco rotas de estado, a R$ 900 cada, mais as páginas próprias do internato e da plataforma Dica Plus, todas já com SEO, AEO e GEO inclusos no preço. É o pacote que coloca a rede no ar mesmo se as páginas por escola do § 10 ficarem para depois.

### Página por região - R$ 900 por estado

`Pacote base` `SEO, AEO e GEO inclusos`

Um modelo de página de região, alimentado pelos dados de cada estado: DF, GO, MS, Mato Grosso e TO. Cada uma lista as unidades da própria região e atende pelo WhatsApp da associação responsável. No Mato Grosso, o lead vai para a associação certa, Leste ou Oeste, pelo município escolhido, sem que a família precise saber dessa divisão. **SEO incluso:** título e descrição da região, endereço canônico e a lista estruturada `ItemList`. **AEO incluso:** perguntas e respostas da região marcadas em `FAQPage`. **GEO incluso:** a praça acompanhada nos buscadores de IA. **O ganho:** é a porta de entrada da família que ainda está escolhendo a cidade. Região nova entra pelo mesmo modelo, só com os dados dela.

**Cálculo:** 5 × R$ 900 = R$ 4.500

### Página do IABC - R$ 1.300

`Pacote base` `SEO, AEO e GEO inclusos`

Rota própria para o internato, separada das 39 escolas de bairro: custo total de mensalidade somada a moradia, rotina, segurança, galeria do campus e agendamento de visita. A família do IABC pesquisa de outro estado e quer ver o lugar antes de decidir. É uma jornada de compra distinta, e uma página própria capta quem hoje se perde entre as escolas de bairro. **SEO, AEO e GEO inclusos:** a busca por internato adventista passa a encontrar o campus, e não a home da rede; as perguntas do internato (custo, rotina, idade mínima, como visitar) entram marcadas em `FAQPage`; e o campus passa a ser acompanhado nos buscadores de IA, que é onde a família de outro estado começa a procurar.

### Página do Dica Plus - R$ 1.300

`Pacote base`

Rota própria de apresentação e captação, com formulário ligado à plataforma. Implementação a partir do layout que vocês desenharem.

**Subtotal do grupo: R$ 7.100**

## § 03 - Captação de leads

O caminho da família até virar contato no CRM.

### Formulário em duas etapas - R$ 400

`Pacote base`

Valida nome, WhatsApp com DDD, região, escola e nível. Divide a fricção em dois passos para elevar a conclusão.

### API de leads e banco - R$ 400

`Pacote base`

O lead é gravado antes de sair para o CRM: se a integração cair, nenhuma família se perde.

### Rastreio de campanha - R$ 200

`Pacote base`

Captura de utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid e fbclid, ligando cada matrícula ao anúncio que a trouxe.

### WhatsApp por região e barra mobile - R$ 200

`Pacote base`

Chat flutuante que troca o número conforme a página aberta, e barra de ação fixa no celular.

**Subtotal do grupo: R$ 1.200**

## § 04 - Painel administrativo

Não é uma tela: são nove módulos de software, do login ao relatório que sai sozinho todo mês. É a parte que a coordenação usa todo dia e a que menos aparece para quem só olha o site.

### Autenticação - R$ 650

`Pacote base`

Login por e-mail e senha, sessões assinadas, cadastro público bloqueado e recuperação de senha por e-mail com link de uso único válido por uma hora.

### Papéis e recorte por região - R$ 500

`Pacote base`

Administrador vê tudo; coordenador vê apenas as regiões atribuídas, e o recorte vale igualmente na exportação e no reenvio, não só na tela.

### Tela de leads - R$ 750

`Pacote base`

Resumo, filtros, detalhe em modal, status de envio ao CRM e status de atendimento devolvido pelo webhook.

### Exportação em CSV - R$ 200

`Pacote base`

Respeita as regiões de quem exporta e fica registrada na trilha de auditoria.

### Reenvio ao CRM - R$ 400

`Pacote base`

Ação manual no painel: botão de reenvio por lead e reprocesso em lote de pendentes e falhas, para a coordenação resolver na hora, sem abrir chamado técnico.

### Gestão de equipe - R$ 450

`Pacote base`

Criar e editar pessoas, atribuir regiões e cortar o acesso na hora, sem esperar a sessão expirar.

### Trilha de auditoria de acesso - R$ 250

`Pacote base`

Registro de login, exportação, reenvio e alterações de equipe: quem viu o dado da família, quando e de onde. Identificadores internos mascarados.

### Motor do relatório mensal - R$ 1.100

`Pacote base`

Não é uma tela, é o cruzamento por trás dela: lê a base de leads, agrupa por região, escola e série pretendida, separa por origem de campanha, compara com o mês anterior e traz de volta do CRM quem foi atendido e quem ficou esperando.

**Por que vale o valor:** o número que interessa não é quantos leads chegaram. É **quais escolas recebem lead e não respondem**, qual associação converte melhor e qual campanha trouxe matrícula em vez de curiosidade. Esse cruzamento é o que transforma o painel de uma lista de contatos em instrumento de gestão da rede. **A alternativa** é alguém exportar CSV e montar a planilha à mão toda virada de mês, para seis coordenações, todo mês, para sempre. E planilha feita à mão diverge, atrasa e ninguém confia nela na hora de decidir.

### Envio automático por e-mail - R$ 600

`Pacote base`

Uma tarefa agendada dispara no primeiro dia útil de cada mês, gera o PDF de cada região e envia por e-mail para a coordenação responsável. Cada associação recebe apenas o que é dela.

**Inclui a configuração do envio:** servidor de e-mail autenticado com o domínio da rede, com `SPF` e `DKIM` assinados para o relatório não cair na caixa de spam; remetente institucional em vez de e-mail pessoal; corpo da mensagem com o resumo do mês já em texto, para quem lê no celular não precisar abrir anexo; PDF anexado; e registro de entrega: quem recebeu, quando, e se algum endereço recusou. O histórico fica guardado no painel, então qualquer mês anterior pode ser baixado sem pedir para ninguém.

**O ganho:** relatório que depende de alguém lembrar de gerar não é lido: chega atrasado, ou não chega. Chegando sozinho na caixa de entrada no dia 1º, ele entra na pauta da reunião do mês.

**Subtotal do grupo: R$ 4.900**

## § 05 - Integrações

Ligação com o CRM de atendimento, com a plataforma Dica Plus e com as plataformas de anúncio.

### Sevenbee: envio do lead - R$ 550

`Pacote base`

Cria o contato com nome, telefone e e-mail, aplica etiquetas de campanha e região e anexa anotação. Não duplica contato: reconhece pelo telefone.

### Sevenbee: webhook de retorno - R$ 400

`Pacote base`

Três eventos de sessão viram o status de atendimento visível no painel: aguardando, em atendimento e atendido.

### Resiliência da integração - R$ 250

`Pacote base`

A parte automática: fila de falhas com nova tentativa a cada 10 minutos, sem ninguém precisar apertar nada, e webhook genérico de reserva caso a rede troque de CRM no futuro. É o que impede uma matrícula de se perder quando o CRM fica fora do ar.

### Analytics e mídia paga - R$ 200

`Pacote base`

GA4 e Meta Pixel com eventos de conversão: geração de lead, clique no WhatsApp e contato.

### Dica Plus: integração - R$ 790

`Pacote base`

Troca de dados com a plataforma de interação. Preço para API documentada com token; sem documentação sobe para R$ 13.700, e sem API nenhuma passa de R$ 16.000.

**Subtotal do grupo: R$ 2.190**

## § 06 - Base técnica de busca

O SEO, o AEO e o GEO de cada página já estão no preço dela, nos § 02 e § 10. Este grupo é outra coisa: a estrutura que todas as 46 páginas usam em comum, construída uma vez.

### Base técnica de indexação - R$ 400

`Pacote base`

Construída uma vez, usada por todas as páginas: `sitemap.xml` e `robots.txt` gerados automaticamente, `Open Graph` padrão para o link chegar com foto e título no WhatsApp, a diretiva `max-image-preview:large`, o mecanismo de endereço canônico que cada rota preenche com a própria URL, e a marcação semântica de `h1`, `nav`, `main` e `article`. **O ganho:** é a fundação. Sem ela, nenhuma página ranqueia, por melhor que seja o texto, e o link compartilhado chega como uma URL seca.

### Dados estruturados da instituição - R$ 250

`Pacote base`

Os esquemas que descrevem a rede como um todo, em `JSON-LD`: `EducationalOrganization` para a instituição, o catálogo geral de unidades e o mecanismo de trilha de navegação em `BreadcrumbList`, que todas as páginas usam. **O ganho:** o Google entende que são 46 páginas de uma mesma rede, e não 46 sites soltos, o que concentra autoridade em vez de dispersar.

### Respostas em destaque da página principal - R$ 400

`Pacote base`

As perguntas frequentes da home, marcadas em `FAQPage` com pares `Question` e `Answer`: as dúvidas gerais sobre a rede, matrícula, valores e proposta pedagógica, escritas no formato que o Google recorta como resposta. **O ganho:** a rede ocupa a **posição zero**, acima do primeiro resultado orgânico, inclusive acima dos concorrentes que pagam anúncio, e é o texto que o Google Assistente lê em voz alta quando alguém pergunta pelo celular.

### Identidade da rede nos buscadores de IA - R$ 550

`Pacote base`

O trabalho de entidade, feito uma vez para a marca: `sameAs` apontando para os perfis oficiais, nome, endereço e telefone idênticos em todas as fontes que os modelos rastreiam, e a verificação inicial de como **ChatGPT, Gemini e Perplexity** respondem por escola adventista no Centro-Oeste. **O ganho:** boa parte das famílias já pergunta à IA antes de abrir o Google, e a IA responde com quem ela reconhece. Quem não é entidade reconhecível simplesmente não aparece, e não há anúncio que compre esse espaço.

### Search Console e Core Web Vitals - R$ 250

`Pacote base`

Configuração do `Google Search Console`, envio do sitemap, primeira auditoria de cobertura e indexação, e auditoria de `Core Web Vitals`: `LCP`, `INP` e `CLS`, com as correções iniciais. **O ganho:** é como saber se o trabalho funcionou. Mostra quais termos já trazem visita, quais páginas o Google recusou indexar e onde a rede perdeu posição. Sem isso, SEO vira fé.

**Subtotal do grupo: R$ 1.850**

## § 07 - LGPD: o que o sistema executa

Só implementação: o comportamento que o site e o painel precisam ter para a coleta ser legal. Redação de política, inventário e parecer ficam com o jurídico da união. O sistema vai guardar nome, WhatsApp, e-mail e a série pretendida da criança, dado de família, informado por um responsável, sobre um menor de idade. É a área de maior exposição jurídica do projeto.

### Consentimento registrado e comprovável - R$ 250

`Pacote base`

O aceite no formulário guarda data, hora e a versão exata do texto que a família leu. **O ganho:** se alguém questionar depois, existe prova de que houve consentimento e de **a quê** a pessoa consentiu. Sem esse registro, o aceite não vale como defesa.

### Aviso de cookies que bloqueia antes do aceite - R$ 300

`Opcional`

Banner que segura o Google Analytics e o Meta Pixel até a família aceitar, e guarda a escolha. **O ganho:** a maioria dos sites exibe o aviso mas dispara a medição assim que a página abre, o que anula o consentimento e é a irregularidade mais fácil de alguém apontar num site que capta dado de criança.

### Prazo de guarda e descarte automático - R$ 500

`Opcional`

Cada tipo de dado ganha um prazo, e uma rotina apaga a identificação do lead que não virou matrícula depois de encerrado o ciclo. **O ganho:** a lei exige guardar só enquanto a finalidade existir. Base antiga acumulada não é zelo: é risco, e é exatamente o que vaza.

### Tela para atender pedidos das famílias - R$ 550

`Opcional`

A lei dá à família o direito de pedir para ver, corrigir, exportar ou apagar os dados dela, e a rede é obrigada a atender. Esta tela deixa a coordenação buscar a família pelo telefone ou e-mail, ver tudo que está guardado e resolver na hora, com o atendimento ficando registrado. **O ganho:** sem ela, cada pedido vira chamado técnico e alguém precisa consultar o banco na mão. Com seis coordenações e milhares de contatos, um pedido esquecido vira reclamação na ANPD.

**Subtotal do grupo: R$ 250**

*opcionais à parte: R$ 1.350*

## § 08 - Infraestrutura e entrega

Colocar no ar, provar que funciona e passar a chave.

### Infraestrutura de produção - R$ 400

`Pacote base`

Container, servidor, apontamento de domínio, certificado, tarefas agendadas e rotina de backup do banco.

### Documentação e treinamento - R$ 250

`Pacote base`

Manual do sistema, guia de publicação e repasse ao vivo para as coordenações das seis associações.

### QA e homologação - R$ 250

`Pacote base`

Espelho idêntico da produção, com banco e servidor de e-mail próprios, para testar o fluxo ponta a ponta antes do lançamento, sem tocar em dado real de família.

**Subtotal do grupo: R$ 900**

## § 09 - Mensalidade

Um valor fixo por mês para o site inteiro, com as 39 escolas inclusas: manutenção de todas as páginas, suporte às landing pages e ao sistema. Tudo que está descrito abaixo entra nele.

### Suporte e manutenção - R$ 980 por mês

`Obrigatório`

**R$ 980 por mês, valor único.** Manutenção de todas as páginas, suporte às landing pages e ao sistema.

**Infraestrutura:** servidor dedicado com o banco de leads, certificado de segurança renovado sozinho, backup diário com 30 dias de retenção e monitoramento que avisa se o site cair.
**Manutenção do sistema:** atualizações de segurança do framework e das bibliotecas, correção de defeitos e a operação da fila automática de reenvio ao CRM.
**Manutenção das páginas:** as 46 páginas no ar e indexadas, com conferência dos dados de cada unidade ao longo do ano e as alterações que a rede pedir: telefone, endereço, WhatsApp, foto, nome de unidade, texto de seção, valores e datas de campanha, perguntas do FAQ. A rede pede, entra no ar, sem contar hora.
**Resultado:** relatório mensal gerado e enviado por e-mail a cada coordenação no primeiro dia útil.
**Busca:** acompanhamento mensal do Search Console, correção de indexação e acompanhamento de como os buscadores de IA respondem por escola adventista em cada praça.
**Dados:** responder as famílias que pedirem para ver, corrigir ou apagar seus dados, e rodar o descarte no prazo.
**Suporte:** às landing pages e ao painel, por e-mail e WhatsApp, em até 2 dias úteis.

**Mensalidade: R$ 980**

## § 10 - Páginas por escola

Bloco complementar. Um modelo de página, 39 conjuntos de dados, com **SEO, AEO e GEO inclusos**. Se a rede fechar só a home, as regiões e o IABC, este grupo inteiro sai do orçamento sem quebrar nada do resto, e pode entrar depois.

### As 39 páginas de escola - R$ 5.900

`Pacote base` `SEO, AEO e GEO inclusos`

Um único modelo de página, alimentado pelos dados de cada unidade: foto, endereço, telefone, WhatsApp da associação e o formulário já apontando para a escola certa. O que muda entre uma e outra é o dado, não o desenho, e por isso o conjunto tem um preço só. Cada uma nasce com título e descrição no nome da cidade, endereço canônico, ficha estruturada `School` com `PostalAddress`, perguntas da unidade em `FAQPage` e a cidade acompanhada nos buscadores de IA. **O ganho:** quando uma família pesquisa por escola cristã com o nome da cidade dela, é esta página que aparece, com a foto da unidade e o botão certo. São 39 endereços disputando, cada um, a busca do próprio município. Escola nova entra pelo mesmo modelo, só com os dados dela.

**Subtotal do grupo: R$ 5.900**

## Resumo - Subtotais por grupo

Cada linha soma os itens do pacote base do grupo; os opcionais aparecem à parte em cada seção. Os grupos são independentes e podem ser contratados em etapas.

| Grupo | Implantação | Por mês |
| --- | --- | --- |
| § 01 Página principal e estrutura | R$ 6.550 | · |
| § 02 Páginas por região, IABC e Dica Plus | R$ 7.100 | · |
| § 03 Captação de leads | R$ 1.200 | · |
| § 04 Painel administrativo | R$ 4.900 | · |
| § 05 Integrações | R$ 2.190 | · |
| § 06 Base técnica de busca | R$ 1.850 | · |
| § 07 LGPD: o que o sistema executa | R$ 250 | · |
| § 08 Infraestrutura e entrega | R$ 900 | · |
| § 09 Mensalidade | · | R$ 980 |
| § 10 Páginas por escola | R$ 5.900 | · |

## § 11 - O que a UCOB faz internamente

Não está no preço. A entrada cobre implementação, não criação. A identidade já veio pronta dos PSDs da campanha dos 130 anos.

- Descoberta e estratégia
- Identidade visual e design
- Redação e conteúdo das páginas
- Fotografia das unidades
- Produção de vídeo e depoimentos
- Verba de mídia paga
- Política de privacidade e parecer jurídico
- Inventário e mapeamento de dados para a ANPD
- Contratos de proteção de dados com o CRM e demais fornecedores
- Plano institucional de resposta a incidente
- Servidor e domínio, se contratados direto

## § 12 - Condições

1. **Licença de uso, não cessão.** A entrada é uma taxa de implantação e licença: dá à rede o direito de usar a plataforma enquanto a mensalidade estiver ativa. O código permanece com o fornecedor. É o que permite a entrada reduzida.
2. **Fidelidade de 24 meses** sobre a mensalidade, com multa de 30% das parcelas restantes em caso de encerramento antecipado. É a contrapartida da entrada reduzida: a implantação é cobrada abaixo do custo de construção e se paga ao longo do contrato.
3. **Horas de desenvolvimento novo** não estão na mensalidade: seções novas, campanhas e pedidos que fujam da manutenção são cobrados a R$ 220 a hora, sempre orçados antes.
4. **Escala.** Escola nova entra por R$ 150 e região nova por R$ 900, sem alterar a mensalidade, já com SEO, AEO e GEO da página, sem alterar a mensalidade. Escola que sair da rede é removida sem custo.
5. **Reajuste anual** pelo IPCA acumulado, na data de aniversário do contrato.
6. **Suspensão por inadimplência** após 30 dias de atraso: o site e o painel saem do ar até a regularização. Os dados das famílias ficam preservados e são devolvidos em CSV se o contrato encerrar.
7. **Dado de menor de idade.** Quem preenche é o responsável, mas a finalidade é a matrícula de uma criança, com a série pretendida no formulário. A LGPD trata isso em regime próprio, e os itens do § 07 são a parte que o sistema executa; a redação e a revisão dos documentos jurídicos ficam com o departamento da própria união.
8. **O que precisamos da rede para começar:** acesso de integração ao CRM de atendimento, a contratação do servidor e o apontamento do domínio. Do lado do conteúdo: o WhatsApp oficial de cada associação, as fotos das unidades e os depoimentos de famílias que a rede queira publicar.
9. **Validade:** 30 dias. Valores líquidos, impostos conforme o regime de emissão.

---

Orçamento · Site de Matrículas 2027 · Educação Adventista Centro-Oeste (UCOB) · setembro de 2026 · válido por 30 dias. A projeção de retorno usa mensalidade escolar média de R$ 900 e deve ser substituída pelo ticket real da rede.
