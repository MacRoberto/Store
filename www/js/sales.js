document.addEventListener('DOMContentLoaded', () => {
    fetchSales();
});

function fetchSales() {
    fetch('../php/sales.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('salesTableBody');
            tableBody.innerHTML = ''; 

            if(data.error) {
                console.error(data.error);
                return;
            }

            data.forEach(sales => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sales.id_sale}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${sales.user_id}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${sales.transaction_date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales.total_amount}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${sales.payment_method}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sales.status}</td>
                `;
                
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error al obtener las ventas:', error));
}