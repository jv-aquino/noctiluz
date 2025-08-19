## API
Nossa API segue majoritariamente padrões REST e pode ser testada utilizando o Bruno.
Requisitos para novas routes:
- Ter boa tipagem
- Priorizar funções utilitárias (como validBody e blockForbiddenRequests)
- Criar testes de integração

### Specs
#### Erros
- Retornar objeto error contendo propriedade message
#### Sucesso
- Retornar apenas objeto, sem message, em caso de sucesso