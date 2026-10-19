# Site IA — recuperação em pasta separada

O portal `001` aponta para esta pasta em `site_ia/`. A tela original do projeto foi preservada em `historico/`, junto da folha de estilos antiga, do logotipo e das fontes que estavam no repositório antes das alterações de setembro de 2026.

## Como usar

Abra `index.html` pelo GitHub Pages em HTTPS, escolha **Ativar câmera** e conceda permissão no navegador. A pré-visualização e a captura acontecem localmente. O botão **Baixar retrato** baixa a foto para o seu próprio dispositivo. O fluxo não envia imagens a um servidor e a câmera é desligada ao sair da página.

## Limite da recuperação

O histórico do Git preserva o HTML `main.html` (mais recente antes do Nexus: 2025-11-27), a folha `style.css` (última versão anterior ao Nexus: 2025-11-02), `logo2.jpg` e as duas fontes. Não há, em nenhum commit, JavaScript de câmera ou um modelo de reconhecimento/avaliação facial. O `script.js` aparece pela primeira vez em 2026-09-13 associado ao site Nexus.

Por isso, `script.js` nesta pasta é uma implementação nova e pequena para câmera e captura local; ela não se apresenta como o modelo antigo e não classifica a aparência de ninguém. A versão histórica sem alterações está em [`historico/main.html`](historico/main.html), [`historico/style.css`](historico/style.css) e inclui os recursos referenciados no mesmo diretório.
