document.addEventListener('DOMContentLoaded', () => {
    fetchInventoryItems();
});

function fetchInventoryItems() {
    fetch('../php/inventory_items.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('inventoryItemsTableBody');
            tableBody.innerHTML = ''; 

            if(data.error) {
                console.error(data.error);
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.id_inventory_item}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.product_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.id_inventory}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">$${item.cost_price}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity_received}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.quantity_avaliable}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${item.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">$${item.sale_price}</td>
                `;
                
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener los ítems de inventario:', error));
}