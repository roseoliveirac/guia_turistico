import axios from 'axios'; 

// Função para buscar destinos
async function fetchDestinations() {
    try {
        const response = await axios.get('http://localhost:3000/destinations'); 
        const destinations = response.data; 

        // Chama a função para exibir os destinos
        displayDestinations(destinations);
    } catch (error) {
        console.error('Erro ao buscar destinos:', error);
    }
}

// Função para exibir os destinos na interface
function displayDestinations(destinations) {
    const destinationsDiv = document.getElementById('destinations');
    destinationsDiv.innerHTML = ''; 

    destinations.forEach(destination => {
        const destinationElement = document.createElement('div'); 
        destinationElement.innerHTML = `
            <h2>${destination.name}</h2>
            <p>${destination.description}</p>
            <img src="${destination.image}" alt="${destination.name}"> <!-- Exibe a imagem do destino -->
        `;
        destinationsDiv.appendChild(destinationElement);
    });
}

fetchDestinations();