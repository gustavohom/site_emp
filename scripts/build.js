const fs = require('fs').promises;
const path = require('path');

// Define os caminhos principais
const ROOT_DIR = path.join(__dirname, '..'); // Raiz do projeto (portal-florestal/)
const SRC_DIR = path.join(ROOT_DIR, 'src');
const CONTENT_DIR = path.join(SRC_DIR, 'content');
const VAGAS_DIR = path.join(CONTENT_DIR, 'vagas');
const CURSOS_DIR = path.join(CONTENT_DIR, 'cursos');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
const ASSETS_DIR = path.join(SRC_DIR, 'assets');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public'); // Pasta de saída

// Função para limpar a pasta de saída antes de gerar
async function cleanOutputDir() {
    console.log(`Limpando ${PUBLIC_DIR}...`);
    try {
        await fs.rm(PUBLIC_DIR, { recursive: true, force: true });
        console.log('Pasta public limpa.');
    } catch (error) {
        if (error.code !== 'ENOENT') { // Ignora erro se a pasta não existe
            console.error('Erro ao limpar a pasta public:', error);
            throw error; // Re-lança outros erros
        }
        console.log('Pasta public não existia, nada a limpar.');
    }
    await fs.mkdir(PUBLIC_DIR, { recursive: true }); // Recria a pasta public
}

// Função para copiar os assets (CSS, JS, etc.)
async function copyAssets() {
    console.log(`Copiando assets e páginas estáticas de ${SRC_DIR} para ${PUBLIC_DIR}...`); // Mensagem atualizada
    try {
        // Cria subdiretórios necessários em public (css, js)
        await fs.mkdir(path.join(PUBLIC_DIR, 'css'), { recursive: true });
        await fs.mkdir(path.join(PUBLIC_DIR, 'js'), { recursive: true });

        // Copia CSS
        await fs.copyFile(
            path.join(ASSETS_DIR, 'css', 'style.css'),
            path.join(PUBLIC_DIR, 'css', 'style.css')
        );
        // Copia JS
        await fs.copyFile(
            path.join(ASSETS_DIR, 'js', 'scripts.js'),
            path.join(PUBLIC_DIR, 'js', 'scripts.js')
        );

        // --- ADICIONADO: Copia a página de detalhe exemplo ---
        console.log('Copiando página de detalhe exemplo...');
        await fs.copyFile(
            path.join(TEMPLATES_DIR, 'detalhe-exemplo.html'), // Origem
            path.join(PUBLIC_DIR, 'detalhe-exemplo.html')     // Destino
        );
        // --- FIM DA ADIÇÃO ---


         // Adicione aqui a cópia de outras pastas de assets (imagens, fontes) se necessário
         // Exemplo: Copiar uma pasta de imagens 'img'
         /* ... (código de cópia de imagens, se houver) ... */

        console.log('Assets e páginas estáticas copiados com sucesso.'); // Mensagem atualizada
    } catch (error) {
        console.error('Erro ao copiar assets ou páginas estáticas:', error); // Mensagem atualizada
        throw error;
    }
}

// Função auxiliar para copiar diretórios recursivamente (se precisar copiar imagens, etc.)
async function copyDirRecursive(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDirRecursive(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}


// Função para ler arquivos de conteúdo de uma pasta
async function readContentFiles(directory) {
    let contentHtml = '';
    try {
        const files = await fs.readdir(directory);
        // Ordenar arquivos alfabeticamente (simples, mas previsível)
        // Para ordenar por data de modificação, usaria fs.stat e ordenaria a lista 'files' antes do loop.
        files.sort();

        for (const file of files) {
            if (file.endsWith('.html')) {
                const filePath = path.join(directory, file);
                console.log(` > Lendo: ${path.relative(ROOT_DIR, filePath)}`); // Loga o arquivo sendo lido
                const fileContent = await fs.readFile(filePath, 'utf-8');
                // Assume que o arquivo contem APENAS o HTML do card (<article>...)
                contentHtml += fileContent.trim() + '\n\n'; // Adiciona o conteúdo do arquivo com uma linha extra
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`Aviso: Diretório de conteúdo não encontrado ou vazio: ${directory}`);
        } else {
            console.error(`Erro ao ler conteúdo de ${directory}:`, error);
            throw error;
        }
    }
    return contentHtml;
}

// Função principal que constrói o index.html
async function buildHtml() {
    console.log('Gerando index.html...');
    try {
        // 1. Ler o template layout
        const layoutPath = path.join(TEMPLATES_DIR, 'layout.html');
        let layoutContent = await fs.readFile(layoutPath, 'utf-8');

        // 2. Ler todos os arquivos de vagas
        console.log(`Lendo arquivos de vagas em: ${VAGAS_DIR}`);
        const vagasHtml = await readContentFiles(VAGAS_DIR);

        // 3. Ler todos os arquivos de cursos
        console.log(`Lendo arquivos de cursos em: ${CURSOS_DIR}`);
        const cursosHtml = await readContentFiles(CURSOS_DIR);

        // 4. Substituir os marcadores no layout pelo conteúdo lido
        layoutContent = layoutContent.replace('<!-- %%VAGAS%% -->', vagasHtml || '<!-- Nenhuma vaga encontrada -->');
        layoutContent = layoutContent.replace('<!-- %%CURSOS%% -->', cursosHtml || '<!-- Nenhum curso encontrado -->');

        // 5. Escrever o arquivo final index.html na pasta public
        const outputIndexPath = path.join(PUBLIC_DIR, 'index.html');
        await fs.writeFile(outputIndexPath, layoutContent, 'utf-8');

        console.log(`index.html gerado com sucesso em ${outputIndexPath}`);
    } catch (error) {
        console.error('Erro ao gerar o index.html:', error);
        throw error;
    }
}

// Função principal para executar o build completo
async function runBuild() {
    console.log('--- Iniciando Build do Portal Florestal ---');
    try {
        await cleanOutputDir();
        await copyAssets();
        await buildHtml();
        console.log('--- Build Concluído com Sucesso! ---');
        console.log(`Para visualizar, abra o arquivo:\n ${path.join(PUBLIC_DIR, 'index.html')}\n no seu navegador.`);
    } catch (error) {
        console.error('### ERRO NO BUILD ###');
        // Removido o log do erro completo aqui para não ser redundante, pois já é logado nas funções internas.
        process.exit(1); // Termina o processo com erro
    }
}

// Executa o build
runBuild();