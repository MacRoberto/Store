document.addEventListener('DOMContentLoaded', () => {
    fetchSales_details();
});

function fetchSales_details() {
    fetch('../php/sales_details.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('sales_detailsTableBody');
            tableBody.innerHTML = ''; 

            if(data.error) {
                console.error(data.error);
                return;
            }

            data.forEach(sales_details => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sales_details.id_sale_item}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${sales_details.sale_id}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${sales_details.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales_details.unit_price}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${sales_details.discount_applied}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales_details.subtotal}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales_details.id_inventory_item}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales_details.id_promotion}</td>
                `;
                
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener los detalles de Venta:', error));
}

