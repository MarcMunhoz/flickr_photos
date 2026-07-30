## Implementation Tasks

### 1. Inspeção e baseline

- [ ] 1.1 Confirmar Node.js 22 em `.node-version`, `app/.node-version`, `app/package.json` e `Dockerfile`.
- [ ] 1.2 Confirmar Yarn v1 e `app/yarn.lock` como gerenciador e lockfile ativos.
- [ ] 1.3 Confirmar Docker e Docker Compose como ambiente canônico para package manager, build e validação.
- [ ] 1.4 Registrar a imagem base `node:22-bookworm-slim` e confirmar que atualizações de runtime ficam na linha Node 22.
- [ ] 1.5 Registrar scripts existentes: `dev`, `build`, `preview`, `start`, `test:unit` e `test:e2e`.
- [ ] 1.6 Registrar que não existem scripts dedicados de `lint` ou `typecheck`.
- [ ] 1.7 Executar instalação inicial em container com Yarn e registrar warnings ou falhas preexistentes.
- [ ] 1.8 Executar baseline containerizado de `yarn build`, `yarn test:unit` e `yarn test:e2e` quando o ambiente permitir.
- [ ] 1.9 Consultar alertas abertos do Dependabot no repositório `MarcMunhoz/flickr_photos` e registrar número, pacote, severidade, range vulnerável e versão corrigida.
- [ ] 1.10 Executar auditoria local suportada pelo Yarn em container e registrar vulnerabilidades, falhas da ferramenta ou limitações.
- [ ] 1.11 Executar `yarn outdated --json` em container e registrar updates patch, minor e major disponíveis.

### 2. Análise das atualizações

- [ ] 2.1 Mapear os alertas abertos para a árvore atual de dependências com foco em `brace-expansion`, `body-parser`, `js-yaml` e `shell-quote`.
- [ ] 2.2 Identificar qual dependência direta introduz cada dependência transitiva vulnerável.
- [ ] 2.3 Classificar updates diretos em grupos: segurança/transitivos, Vue, Vite/build, testes, Express/runtime, utilitários de desenvolvimento e majors de maior risco.
- [ ] 2.4 Consultar notas de migração ou changelogs para major upgrades candidatos, especialmente Vite 8, Express 5, datepicker 14, Vue Router 5, ESLint 10, less-loader 13, jsdom 30 e concurrently 10.
- [ ] 2.5 Definir quais major upgrades são viáveis nesta manutenção e quais devem ser adiados com justificativa técnica.
- [ ] 2.6 Identificar dependências que exigem `resolutions` e registrar por que uma atualização direta não é suficiente.

### 3. Atualização do ambiente

- [ ] 3.1 Manter `.node-version`, `app/.node-version` e `app/package.json` na linha Node 22.
- [ ] 3.2 Atualizar tags de imagem base somente se houver versão Node 22 compatível e justificativa de manutenção.
- [ ] 3.3 Preservar Yarn v1 e não introduzir `package-lock.json`, `pnpm-lock.yaml` ou outro lockfile concorrente.
- [ ] 3.4 Confirmar que a imagem/container atualizado instala dependências e inicia a aplicação sem erro de resolução de pacotes.

### 4. Atualização das dependências

- [ ] 4.1 Aplicar primeiro updates que corrigem alertas do Dependabot ou vulnerabilidades locais.
- [ ] 4.2 Atualizar dependências diretas compatíveis em `app/package.json` por grupos controlados.
- [ ] 4.3 Atualizar dependências transitivas por meio das dependências diretas responsáveis sempre que possível.
- [ ] 4.4 Adicionar ou ajustar `resolutions` no menor escopo prático somente para vulnerabilidades transitivas sem correção direta compatível.
- [ ] 4.5 Aplicar major upgrades considerados tecnicamente viáveis e adaptar código, configuração ou testes afetados.
- [ ] 4.6 Adiar major upgrades incompatíveis ou desproporcionais e registrar versão atual, versão alvo, motivo e risco residual.
- [ ] 4.7 Regenerar `app/yarn.lock` com Yarn em container e confirmar consistência com `app/package.json`.
- [ ] 4.8 Verificar que nenhum arquivo sensível ou `.env*` foi lido ou usado durante a manutenção.

### 5. Correção e verificação de vulnerabilidades

- [ ] 5.1 Confirmar que `brace-expansion` está em versão corrigida ou documentar por que o alerta não se aplica.
- [ ] 5.2 Confirmar que `body-parser` está em versão corrigida ou documentar por que o alerta não se aplica.
- [ ] 5.3 Confirmar que `js-yaml` está em versão corrigida ou documentar por que o alerta não se aplica.
- [ ] 5.4 Confirmar que `shell-quote` está em versão corrigida ou documentar por que o alerta não se aplica.
- [ ] 5.5 Corrigir vulnerabilidades adicionais encontradas pela auditoria local quando houver versão compatível disponível.
- [ ] 5.6 Documentar vulnerabilidades residuais com dependência de origem, severidade, exposição, motivo e recomendação futura.

### 6. Validação da aplicação

- [ ] 6.1 Executar instalação limpa em container com Yarn e confirmar ausência de erros não justificados.
- [ ] 6.2 Executar `yarn build` em container.
- [ ] 6.3 Executar `yarn test:unit` em container.
- [ ] 6.4 Executar `yarn test:e2e` em container ou via perfil Compose de teste.
- [ ] 6.5 Inicializar a aplicação em container.
- [ ] 6.6 Revisar stdout e stderr de startup para exceções, falhas de dependência, módulos ausentes e configuração runtime bloqueante.
- [ ] 6.7 Validar fluxos críticos cobertos por Cypress para galeria pública, fotos recentes, navegação e estados de erro ou vazio.
- [ ] 6.8 Comparar falhas atuais com o baseline e corrigir regressões introduzidas pelas atualizações.
- [ ] 6.9 Registrar explicitamente que lint e typecheck não foram executados por não existirem scripts dedicados no projeto.

### 7. Auditoria final

- [ ] 7.1 Reexecutar auditoria local suportada pelo Yarn em container.
- [ ] 7.2 Reconsultar alertas abertos do Dependabot no GitHub.
- [ ] 7.3 Comparar o resultado final com o baseline inicial.
- [ ] 7.4 Confirmar quais vulnerabilidades foram corrigidas, permaneceram, deixaram de ser aplicáveis ou surgiram durante a atualização.
- [ ] 7.5 Confirmar que `app/package.json` e `app/yarn.lock` permanecem consistentes.

### 8. Revisão de escopo e documentação

- [ ] 8.1 Revisar o diff e remover alterações não relacionadas a dependências, vulnerabilidades ou compatibilidade necessária.
- [ ] 8.2 Registrar principais versões anteriores e novas das dependências alteradas.
- [ ] 8.3 Registrar major upgrades aplicados e major upgrades adiados com justificativa.
- [ ] 8.4 Registrar comandos de validação executados, ambiente usado e resultado de cada comando.
- [ ] 8.5 Registrar limitações de infraestrutura, rede, Docker, Cypress, serviços externos ou permissões que afetaram a validação.
- [ ] 8.6 Preparar resumo final com vulnerabilidades corrigidas, riscos residuais e recomendações de manutenção futura.
