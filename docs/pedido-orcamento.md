# Solicitação de orçamento: site de captação de matrículas para rede de 40 unidades

Olá,

Estou levantando orçamento para o site de captação de matrículas 2027 de uma rede de ensino com 39 escolas em cinco estados (DF, GO, MS, MT e TO) e um internato. Abaixo está o escopo fechado. Peço que a resposta siga a mesma numeração, com preço por item, para que eu consiga comparar.

Tecnologia sugerida: Next.js (App Router), React, TypeScript, Tailwind e Postgres, hospedado em servidor próprio (VPS) com Docker. Se preferir outra base, indique o motivo.

## 1. Página principal

Landing page de campanha com 12 seções: hero, tarja de destaques, rede mundial, mapa interativo das regiões, com versão leve para celular, níveis de ensino, diferenciais, um dia na escola, o mundo, depoimentos, destaque do internato, perguntas frequentes e formulário de matrícula. Página de confirmação pós-cadastro, página de erro e arte de compartilhamento. Componentes reaproveitáveis, acessibilidade (foco, contraste, teclado, menos movimento) e comportamento responsivo em todas as rotas.

## 2. Páginas por estado e do internato

Cinco rotas de região (DF, GO, MS, Mato Grosso, TO), cada uma listando as unidades do estado e com WhatsApp da associação responsável. No Mato Grosso, o lead é roteado para uma de duas associações conforme o município. Uma página própria para o internato, com estrutura de venda distinta (custo total, rotina, campus, agendamento de visita). Todas com SEO, AEO e GEO da página inclusos. Cotar preço por página de estado e preço da página do internato.

## 3. Páginas por escola

Uma rota por unidade (39), com foto, endereço, telefone, dados estruturados de escola e formulário já apontando para a unidade. Título e descrição com o nome da cidade, endereço canônico, esquema School com PostalAddress, perguntas e respostas da unidade em FAQPage e acompanhamento da cidade nos buscadores de IA. Cotar preço por página, para eu escalar de 10 a 39.

## 4. Captação de leads

Formulário em duas etapas com validação de WhatsApp com DDD; API que grava o lead em banco antes de enviar ao CRM; captura de utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid e fbclid; chat flutuante de WhatsApp que troca o número conforme a região da página; barra de ação fixa no celular.

## 5. Painel administrativo

Autenticação por e-mail e senha com recuperação por e-mail; papéis de administrador e coordenador com recorte por região, valendo também na exportação e no reenvio; tela de leads com filtros, detalhe e status; exportação CSV; reenvio ao CRM individual e em lote; gestão de equipe; trilha de auditoria de acesso aos dados; motor de relatório mensal (por região, escola, série, origem de campanha, comparação mês a mês, taxa de atendimento) e envio automático do PDF por e-mail no primeiro dia útil, com SPF e DKIM configurados e registro de entrega.

## 6. Integrações

Envio do lead ao CRM Sevenbee (contato sem duplicar por telefone, etiquetas, anotação); webhook de retorno com status de atendimento; fila automática de reenvio em falha a cada 10 minutos e webhook genérico de reserva; GA4 e Meta Pixel com eventos de conversão.

## 7. SEO, AEO e GEO da rede

Sitemap, robots, canonical, Open Graph, max-image-preview:large e marcação semântica; dados estruturados em JSON-LD (EducationalOrganization, ItemList, BreadcrumbList); FAQPage para resposta em destaque; consolidação de entidade para buscadores de IA (sameAs, consistência de nome, endereço e telefone) com verificação inicial; configuração do Search Console com primeira auditoria de indexação e Core Web Vitals.

## 8. LGPD no sistema

Consentimento registrado com data, hora e versão do texto; aviso de cookies que bloqueia GA4 e Pixel até o aceite; rotina de descarte automático de leads não convertidos após o ciclo; tela no painel para atender pedidos de acesso, correção e exclusão das famílias. Documentos jurídicos não fazem parte do escopo.

## 9. Infraestrutura e entrega

Container Docker, servidor, domínio, certificado, tarefas agendadas e rotina de backup do banco; ambiente espelho para homologação; documentação e treinamento remoto para seis coordenações.

## 10. Mensalidade

Cotar separadamente: (a) mensalidade sem as páginas por escola, cobrindo servidor, backup diário, monitoramento, atualizações de segurança, operação da fila de reenvio, relatório mensal, acompanhamento de Search Console e buscadores de IA, atendimento a pedidos de dados e suporte por e-mail, incluindo alterações de dados nas páginas (telefone, endereço, foto, textos); e (b) valor adicional por página de escola mantida, por mês.

## 11. Opcionais, cotar à parte

Integração com a plataforma Dica Plus (API REST documentada) e página dedicada a ela; cessão definitiva do código-fonte, caso o modelo padrão seja licença de uso.

Fora do escopo, fornecidos por nós: estratégia, identidade visual e layouts, redação e conteúdo, fotografia e vídeo, verba de mídia e documentos jurídicos.

Peço que a proposta traga:

- preço por item, seguindo a numeração acima, com o valor unitário das páginas de estado e de escola;
- mensalidade nos dois cenários do item 10;
- prazo de entrega por etapa e prazo total;
- modelo de propriedade: licença de uso ou cessão do código, e o preço de cada;
- valor da hora para desenvolvimento fora do escopo;
- condições de pagamento e validade da proposta.

Se puder responder até [data], agradeço. Fico à disposição para uma conversa de alinhamento antes da proposta.

Atenciosamente,

[Nome]  
[Telefone]
