document.addEventListener('DOMContentLoaded', () => {
    fetchActions();
});

function fetchActions() {
    fetch('../php/actions.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('actionsTableBody');
            tableBody.innerHTML = ''; 

            if(data.error) {
                console.error(data.error);
                return;
            }

            data.forEach(action => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${action.id_action}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${action.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${action.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${action.id_module}</td>
                `;
                
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener las acciones:', error));
}