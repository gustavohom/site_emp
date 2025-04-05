document.addEventListener('DOMContentLoaded', () => {
    // --- Script para Ano Atual no Rodapé ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Lógica de Filtro Multi-Seleção ---
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"][name="filter"]');
    const dataItems = document.querySelectorAll('.main-content .data-item'); // Cards de vagas, cursos, etc.
    const clearButton = document.querySelector('.clear-filters-btn');

    // Função para aplicar os filtros selecionados
    function applyFilters() {
        const activeFilters = Array.from(filterCheckboxes)
                                  .filter(checkbox => checkbox.checked)
                                  .map(checkbox => checkbox.value); // Pega os 'value' dos checkboxes marcados

        console.log("Filtros ativos:", activeFilters); // Log para depuração

        dataItems.forEach(item => {
            const itemCategoriesString = item.getAttribute('data-category') || '';
            // Converte as categorias do item (separadas por espaço) em um array
            const itemCategories = itemCategoriesString.split(' ').filter(cat => cat.length > 0);

            let shouldShow = false;

            if (activeFilters.length === 0) {
                // Se nenhum filtro está ativo, mostra todos os itens
                shouldShow = true;
            } else {
                // Lógica "OR": Mostra o item se *PELO MENOS UMA* das categorias do item
                // estiver presente nos filtros ativos.
                shouldShow = activeFilters.some(activeFilter => itemCategories.includes(activeFilter));

                // Lógica "AND" (Alternativa - mais restritiva): Mostra o item apenas se
                // *TODAS* as categorias dos filtros ativos estiverem presentes no item.
                // shouldShow = activeFilters.every(activeFilter => itemCategories.includes(activeFilter));
            }

            // Aplica o display baseado na lógica
            if (shouldShow) {
                item.style.display = 'flex'; // Ou o display original do card
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Adiciona o listener de evento 'change' para cada checkbox
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    // Função para limpar os filtros (chamada pelo botão)
    window.clearFilters = function() {
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        applyFilters(); // Re-aplica os filtros (que agora estão vazios)
    }

    // Aplica os filtros inicialmente (caso a página recarregue com filtros marcados, embora raro sem backend)
    applyFilters();

    // Adiciona log para verificar se os elementos são selecionados corretamente
    console.log("Checkboxes de filtro encontrados:", filterCheckboxes.length);
    console.log("Itens de dados encontrados:", dataItems.length);

}); // Fim do DOMContentLoaded

// Alerta de funcionalidade não implementada (pode manter se quiser)
function alertNotImplemented() {
    alert('Funcionalidade de Newsletter não implementada neste mockup estático.');
}
// Se o seu botão de newsletter ainda tiver onclick="alert(...)", pode remover e adicionar id="newsletter-btn"
// e descomentar o código abaixo no DOMContentLoaded:
// const newsletterBtn = document.getElementById('newsletter-btn');
// if (newsletterBtn) {
//     newsletterBtn.addEventListener('click', alertNotImplemented);
// }