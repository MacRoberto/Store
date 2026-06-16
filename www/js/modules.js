document.addEventListener('DOMContentLoaded', () => {
    fetchModules();
});

function fetchModules() {
    fetch('../php/modules.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('modulesTableBody');
            tableBody.innerHTML = ''; 

            if(data.error) {
                console.error(data.error);
                return;
            }

            data.forEach(module => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${module.id_module}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${module.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${module.description}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${module.img}</td>
                `;
                
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener los módulos:', error));
}