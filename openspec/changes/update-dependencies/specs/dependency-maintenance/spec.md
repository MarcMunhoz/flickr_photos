## ADDED Requirements

### Requirement: Project environment assessment

A implementação SHALL inspecionar o ambiente e a estrutura do projeto antes de alterar versões ou dependências.

#### Scenario: Runtime and package manager identification

- **WHEN** a manutenção for iniciada
- **THEN** o runtime Node.js 22 SHALL ser identificado a partir de `.node-version`, `app/.node-version`, `app/package.json` e Docker
- **AND** Yarn v1 e `app/yarn.lock` SHALL ser identificados como gerenciador e lockfile ativos
- **AND** os scripts existentes de instalação, execução, build, unit tests e E2E SHALL ser registrados

#### Scenario: Containerized project

- **WHEN** o projeto possuir `Dockerfile` e `docker-compose.yaml`
- **THEN** a imagem `node:22-bookworm-slim` e suas limitações SHALL ser identificadas
- **AND** comandos de instalação, auditoria, build e validação SHALL ser executados no ambiente containerizado apropriado
- **AND** atualizações do runtime SHALL permanecer compatíveis com a linha Node 22

### Requirement: Dependency baseline

A implementação SHALL registrar o estado das dependências e vulnerabilidades antes das alterações.

#### Scenario: Initial dependency inventory

- **WHEN** a análise inicial for realizada
- **THEN** dependências diretas relevantes de `app/package.json` SHALL ser registradas
- **AND** versões desatualizadas e atualizações major disponíveis SHALL ser analisadas com Yarn dentro do container
- **AND** dependências transitivas críticas ou vulneráveis SHALL ser identificadas quando possível

#### Scenario: Initial security audit

- **WHEN** Yarn ou GitHub fornecerem dados de vulnerabilidade
- **THEN** alertas do Dependabot e auditoria local SHALL ser registrados como baseline
- **AND** falhas da própria ferramenta de auditoria SHALL ser diferenciadas de vulnerabilidades reais do projeto

### Requirement: Maximum technically safe update

A implementação SHALL atualizar as dependências ao máximo tecnicamente possível sem comprometer o funcionamento da aplicação.

#### Scenario: Compatible dependency update

- **WHEN** uma versão mais recente for compatível com Node 22, Vue 3, Vite, Express, Netlify Functions, Vitest e Cypress
- **THEN** a dependência SHALL ser atualizada
- **AND** `app/yarn.lock` SHALL ser atualizado consistentemente

#### Scenario: Major update requiring migration

- **WHEN** uma atualização major exigir alterações no código ou nas configurações
- **THEN** os breaking changes SHALL ser analisados
- **AND** as adaptações necessárias SHALL ser implementadas quando tecnicamente viáveis dentro do escopo de manutenção
- **AND** o funcionamento afetado SHALL ser validado pelos testes e build existentes

#### Scenario: Update cannot be safely applied

- **WHEN** uma atualização não puder ser aplicada com segurança
- **THEN** a dependência SHALL permanecer na versão mais alta considerada segura e compatível
- **AND** a limitação técnica e o risco residual SHALL ser documentados

### Requirement: Direct and transitive dependency maintenance

A implementação SHALL considerar dependências diretas e transitivas durante a manutenção.

#### Scenario: Direct dependency update

- **WHEN** uma dependência declarada diretamente estiver desatualizada
- **THEN** sua atualização SHALL ser avaliada
- **AND** a versão mais recente tecnicamente viável SHALL ser utilizada

#### Scenario: Transitive dependency vulnerability

- **WHEN** uma vulnerabilidade estiver localizada em uma dependência transitiva
- **THEN** a árvore de dependências SHALL ser analisada
- **AND** a correção SHALL priorizar a atualização da dependência direta responsável
- **AND** Yarn `resolutions` SHALL ser usado somente quando uma atualização direta compatível não resolver a vulnerabilidade

#### Scenario: Unsupported forced installation

- **WHEN** houver incompatibilidades entre dependências
- **THEN** a implementação SHALL resolver a causa técnica da incompatibilidade
- **AND** SHALL NOT utilizar opções que simplesmente ignorem conflitos sem justificativa

### Requirement: Dependabot alert remediation

A implementação SHALL analisar e tratar os alertas abertos do Dependabot para o repositório `MarcMunhoz/flickr_photos`.

#### Scenario: Applicable Dependabot alert

- **WHEN** um alerta aberto corresponder à árvore de dependências utilizada
- **THEN** a vulnerabilidade SHALL ser corrigida por atualização, substituição ou resolução tecnicamente segura
- **AND** a correção SHALL ser validada por auditoria ou inspeção da árvore de dependências

#### Scenario: Current open alerts

- **WHEN** a implementação tratar os alertas abertos consultados em 2026-07-30
- **THEN** ela SHALL abordar `brace-expansion` `< 1.1.16`, `body-parser` `< 1.20.6`, `js-yaml` `< 3.15.0`, e `shell-quote` `<= 1.8.4`
- **AND** cada alerta SHALL ser marcado como corrigido, não aplicável ou residual com justificativa

#### Scenario: Dependabot alert cannot be resolved

- **WHEN** uma vulnerabilidade não puder ser corrigida sem impacto desproporcional ou incompatibilidade
- **THEN** a razão SHALL ser documentada
- **AND** a severidade e a exposição real SHALL ser analisadas
- **AND** possíveis medidas de mitigação SHALL ser registradas

### Requirement: Local vulnerability discovery

A implementação SHALL procurar vulnerabilidades adicionais além das informadas pelo Dependabot.

#### Scenario: Additional local vulnerability

- **WHEN** a auditoria local identificar uma vulnerabilidade adicional aplicável
- **THEN** ela SHALL receber o mesmo processo de análise e correção utilizado para os alertas do Dependabot

#### Scenario: Vulnerability in unused dependency path

- **WHEN** uma vulnerabilidade estiver associada a um caminho não utilizado ou apenas a uma dependência de desenvolvimento
- **THEN** sua exposição real SHALL ser analisada
- **AND** ela SHALL NOT ser ignorada automaticamente apenas por não estar no código de produção

### Requirement: Existing validation discovery

A implementação SHALL identificar os mecanismos de validação realmente disponíveis no projeto.

#### Scenario: Validation tools exist

- **WHEN** o projeto possuir build e testes configurados
- **THEN** `yarn build`, `yarn test:unit` e `yarn test:e2e` SHALL ser identificados
- **AND** eles SHALL ser executados em container após as alterações quando aplicáveis

#### Scenario: Validation tool does not exist

- **WHEN** lint, typecheck ou outro mecanismo não estiver configurado como script do projeto
- **THEN** sua execução SHALL NOT ser exigida
- **AND** uma nova ferramenta SHALL NOT ser instalada automaticamente apenas para esta manutenção
- **AND** a indisponibilidade SHALL ser registrada

#### Scenario: Validation command exists but is already broken

- **WHEN** um mecanismo de validação falhar antes das alterações
- **THEN** a falha SHALL ser registrada no baseline
- **AND** falhas preexistentes SHALL ser diferenciadas de regressões introduzidas pela manutenção

### Requirement: Functional preservation

A implementação SHALL preservar o comportamento existente da aplicação.

#### Scenario: Automated validation is available

- **WHEN** o projeto possuir Vitest e Cypress configurados
- **THEN** todos os mecanismos aplicáveis SHALL ser executados
- **AND** regressões introduzidas pela manutenção SHALL ser corrigidas

#### Scenario: Application startup validation

- **WHEN** a aplicação for inicializada no ambiente suportado
- **THEN** stdout e stderr SHALL ser revisados para erros de startup, exceções não tratadas, falhas de resolução de dependências e configuração runtime ausente que bloqueie a aplicação

#### Scenario: Application cannot be fully executed locally

- **WHEN** dependências externas ou restrições de infraestrutura impedirem a execução completa
- **THEN** a melhor validação possível SHALL ser realizada
- **AND** as limitações SHALL ser explicitamente documentadas
- **AND** SHALL NOT ser afirmado que o funcionamento total foi comprovado sem evidências suficientes

### Requirement: Final security verification

A implementação SHALL comparar o estado final de segurança com o baseline inicial.

#### Scenario: Final audit

- **WHEN** as atualizações forem concluídas
- **THEN** uma nova auditoria SHALL ser executada quando suportada pelo projeto
- **AND** os resultados SHALL ser comparados com o baseline
- **AND** vulnerabilidades corrigidas, restantes e novas SHALL ser identificadas

#### Scenario: Residual vulnerability

- **WHEN** uma vulnerabilidade permanecer após a manutenção
- **THEN** sua dependência de origem, severidade, exposição e motivo SHALL ser registrados
- **AND** uma recomendação de tratamento futuro SHALL ser apresentada

### Requirement: Change scope preservation

A implementação SHALL limitar as alterações ao necessário para atualizar dependências, corrigir vulnerabilidades e preservar compatibilidade.

#### Scenario: Unrelated change identified

- **WHEN** uma alteração não for necessária para a manutenção
- **THEN** ela SHALL NOT ser incluída
- **AND** mudanças de funcionalidade, arquitetura ou interface não relacionadas SHALL ser evitadas

### Requirement: Maintenance outcome documentation

A implementação SHALL produzir um resumo verificável dos resultados.

#### Scenario: Maintenance completion

- **WHEN** a manutenção for concluída
- **THEN** o resumo SHALL informar as principais versões anteriores e novas
- **AND** SHALL informar as vulnerabilidades corrigidas e restantes
- **AND** SHALL informar os comandos de validação executados
- **AND** SHALL registrar dependências que não puderam ser atualizadas
- **AND** SHALL registrar riscos e limitações residuais
