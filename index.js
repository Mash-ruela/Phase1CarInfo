document.addEventListener("DOMContentLoaded", () => {
    fetchCars();
    document.getElementById("dark-mode-toggle").addEventListener("click", toggleDarkMode);
    document.getElementById("add-car-form").addEventListener("submit", addNewCar);
    document.getElementById("add-feature-form").addEventListener("submit", addFeature);
});

// Update the API URL to your deployed backend
const API_URL = 'https://elephant-m9wx.onrender.com/cars';

function fetchCars() {
    fetch(API_URL)
        .then(response => response.json())
        .then(cars => {
            if (!Array.isArray(cars)) {
                throw new Error("Invalid data format: Expected an array");
            }
            displayLogos(cars);
            populateCarDropdown(cars);
        })
        .catch(error => {
            console.error("Error fetching cars:", error);
            const logoContainer = document.getElementById("logo-container");
            logoContainer.innerHTML = "<p>Failed to load car data. Please try again later.</p>";
        });
}

function displayLogos(cars) {
    const logoContainer = document.getElementById("logo-container");
    logoContainer.innerHTML = "";

    cars.forEach(car => {
        const logoButton = document.createElement("button");
        logoButton.classList.add("logo-button");
        logoButton.innerHTML = `<img src="${car.logo}" alt="${car.name} Logo">`;
        logoButton.addEventListener("click", () => displayCarInfo(car));
        logoContainer.appendChild(logoButton);
    });
}

function displayCarInfo(car) {
    const carInfo = document.getElementById("car-info");
    carInfo.innerHTML = `
        <h3>${car.name}</h3>
        <p><strong>Founder:</strong> ${car.founder}</p>
        <p><strong>Year:</strong> ${car.year}</p>
        <p><strong>Country:</strong> ${car.country}</p>
        <p>${car.history}</p>
        <h4>Popular Models:</h4>
        <div class="models-container">
            ${car.popular_models.map(model => `
                <div class="model-card">
                    <h5>${model.name} (${model.year})</h5>
                    <img src="${model.image}" alt="${model.name}">
                    <p>${model.info}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function populateCarDropdown(cars) {
    const carSelect = document.getElementById("car-select");
    carSelect.innerHTML = "";

    cars.forEach(car => {
        const option = document.createElement("option");
        option.value = car.name;
        option.textContent = car.name;
        carSelect.appendChild(option);
    });
}

function addNewCar(event) {
    event.preventDefault();

    const newCar = {
        name: document.getElementById("car-name").value,
        founder: document.getElementById("car-founder").value,
        year: document.getElementById("car-year").value,
        country: document.getElementById("car-country").value,
        history: document.getElementById("car-history").value,
        logo: document.getElementById("car-logo").value,
        popular_models: []
    };

    if (!newCar.name || !newCar.founder || !newCar.year || !newCar.country || !newCar.history || !newCar.logo) {
        alert("Please fill out all the fields.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCar)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add new car: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Car added successfully:", data);
        fetchCars(); 
        alert("New car added successfully!");
    })
    .catch(error => {
        console.error("Error adding car:", error);
        alert("There was an error adding the car. Please try again.");
    });
}

function addFeature(event) {
    event.preventDefault();

    const carName = document.getElementById("car-select").value;
    const newFeature = {
        name: document.getElementById("model-name").value,
        year: document.getElementById("model-year").value,
        info: document.getElementById("model-info").value,
        image: document.getElementById("model-image").value
    };

    fetch(API_URL)
        .then(response => response.json())
        .then(cars => {
            const car = cars.find(car => car.name === carName);
            car.popular_models.push(newFeature);

            return fetch(`${API_URL}/${car.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ popular_models: car.popular_models })
            });
        })
        .then(() => fetchCars())
        .catch(error => {
            console.error("Error adding feature:", error);
            alert("There was an error adding the feature. Please try again.");
        });
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}
