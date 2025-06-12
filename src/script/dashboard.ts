// src/scripts/dashboard.js
import { authenticatedFetch, initMessageBox, displayMessage } from '../lib/util';

export function initDashboard() {
    const fetchDataButton = document.getElementById('fetchDataButton');
    const fetchResultDiv = document.getElementById('fetchResult');
    
    initMessageBox('messageBox');

    if (fetchDataButton && fetchResultDiv) {
        fetchDataButton.addEventListener('click', async () => {
            fetchResultDiv.textContent = 'Fetching data...';
            displayMessage('Attempting to fetch data...', false);

            try {
                const response = await authenticatedFetch('/api/proxied-data', { method: 'GET' });
                const data = await response.json();

                fetchResultDiv.textContent = JSON.stringify(data, null, 2);
                fetchResultDiv.classList.remove('text-red-700');
                fetchResultDiv.classList.add('text-gray-800');
                displayMessage('Data fetched successfully!', false);

            } catch (error) {
                fetchResultDiv.classList.remove('text-gray-800');
                fetchResultDiv.classList.add('text-red-700');
                console.error('Overall operation failed:', error);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initDashboard);