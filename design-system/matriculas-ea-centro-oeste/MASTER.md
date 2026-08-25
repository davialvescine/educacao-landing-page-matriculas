# MASTER — Design System | Matrículas EA Centro-Oeste

> Fonte de verdade. Identidade OFICIAL da campanha "Educando Gerações com Valores pra Vida"
> (Campanha Educ 2027 — UCOB). Sobrepõe qualquer sugestão genérica de ferramenta.
> Tokens implementados em `src/app/globals.css` (@theme + camada semântica shadcn).

## Pattern (conversão)
- Feature-Rich Showcase: Hero (super banner) > Regiões (grid 6) > Diferenciais > IABC > Form (CTA final)
- CTA repetido: header (sticky) + hero + após diferenciais + formulário
- 1 mensagem por card; hierarquia clara

## Cores (amostradas das artes oficiais em PSD)
| Papel | Token | Hex |
|---|---|---|
| Primary (azul royal) | `--color-brand-700` / `--primary` | #12269e |
| Primary hover | `--color-brand-600` | #1b36b8 |
| Azul profundo (footer/stats) | `--color-brand-950` | #050c42 |
| Ouro claro (bg hero) | `--color-gold-300` | #f8e068 |
| Ouro (accent campanha) | `--color-gold-400` | #f8c038 |
| Laranja (borda hero) | `--color-gold-600` | #f87810 |
| Superfície | `--color-surface` | #ffffff |
| Papel | `--color-paper` | #f8f9fd |
| Texto | `--color-ink` | #0e1330 |
| Texto suave | `--muted-foreground` | #565f82 |
| Borda | `--border` | #dce3fd |
| Ring | `--ring` | #5372ec |

Regra: componente NUNCA usa hex; só tokens/utilitários (brand-*, gold-*, primary, etc.).

## Tipografia
- Única família: Plus Jakarta Sans (400–800), próxima do lettering geométrico da campanha
- Headlines de campanha: usar as ARTES oficiais (slogan-valores.webp) — não recriar em texto
- Base 16px; line-height 1.5; títulos tracking-tight

## Assets oficiais (public/imagens/campanha/)
- hero-mosaico.jpg (fundo ouro mosaico 3840w) · letra-a.webp · brilho.webp
- camila.webp / daniel.webp / amanda.webp (recortes de alunos)
- slogan-valores.webp (headline oficial) · selo-130-anos.png · muito-alem-do-ensino.png
- logo-ea.png (azul) · selo-matriculas-abertas.png · qr-code.png · site-url.png

## Raio e sombra
- --radius: 1rem; cards rounded-xl/2xl (chunky, campanha é jovem)
- Sombras: --shadow-card / --shadow-card-hover / --shadow-cta / --shadow-foto

## Motion
- Hero em camadas: ken-burns (bg), float (letra A), glow (brilho), rise/pop (conteúdo, stagger 0.05–0.55s)
- Scroll: Reveal (IntersectionObserver) com stagger 0.1s por coluna
- Easing padrão: cubic-bezier(0.22, 1, 0.36, 1); prefers-reduced-motion respeitado

## Checklist de entrega (da skill ui-ux-pro-max)
- [ ] Sem emoji como ícone (Lucide/SVG ou assets oficiais)
- [ ] cursor-pointer em clicáveis; hover 150–300ms
- [ ] Contraste texto 4.5:1 (azul brand-800+ sobre ouro; branco sobre brand-700+)
- [ ] Foco visível (ring shadcn); navegação por teclado
- [ ] prefers-reduced-motion
- [ ] Testar 375 / 768 / 1024 / 1440px — sem scroll horizontal

## Anti-patterns
- Não usar dark mode (campanha é clara/vibrante)
- Não recriar o lettering oficial em HTML — usar as artes
- Não misturar outro acento além de azul royal + ouro
