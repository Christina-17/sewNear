document.addEventListener("DOMContentLoaded", function () {
    let openFormBtn = document.getElementById("openFormBtn");

    if (!openFormBtn) {
       // console.error("Error: openFormBtn not found!");
        return;
    }

    openFormBtn.addEventListener("click", function () {
        document.getElementById("formPopup").style.display = "block";
    });
});

function closeForm() {
    document.getElementById('formPopup').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none'; // Hide overlay
    setTimeout(() => {
        window.location.href = "findtailor.html";
    }, 1000);
}


function previewImage(event) {
    let file = event.target.files[0];
    let photoPreview = document.getElementById('photoPreview');

    if (file) {
        let reader = new FileReader();
        reader.onload = function (e) {
            photoPreview.src = e.target.result;
            photoPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        photoPreview.src = "defaulttailor.jpg";
    }
}

async function saveTailor(editId = null) {
    let name = document.getElementById('tailorName').value.trim();
    let shop = document.getElementById('shopName').value.trim();
    let address = document.getElementById('tailorAddress').value.trim();
    let contact = document.getElementById('tailorContact').value.trim();

    if (!name || !shop || !address || !contact) {
        alert("Please fill in all required fields.");
        return;
    }

    let tailor = {
        name,
        shop,
        address,
        contact,
        whatsapp: document.getElementById('tailorWhatsApp').value.trim(),
        specialization: document.getElementById('tailorSpecialization').value.trim(),
        tailoringType: document.getElementById('tailorType').value.trim(),
        fabric: document.getElementById('fabricExpertise').value.trim(),
        price: document.getElementById('tailorPrice').value.trim(),
        workingHours: document.getElementById('tailorHours').value.trim(),
        pickup: document.getElementById('homePickup').value.trim(),
        express: document.getElementById('expressDelivery').value.trim(),
        photoSrc: document.getElementById("photoPreview").getAttribute("data-filename") || "defaulttailor.jpg"
    };

    try {
        let url = editId ? `http://localhost:5000/tailor/editTailor/${editId}` : 'http://localhost:5000/tailor/add';
        let method = editId ? 'PUT' : 'POST';

        let response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tailor)
        });

        let result = await response.json();
        alert(result.message);
        closeForm();
        displayTailors();
    } catch (error) {
        alert("Error saving tailor: " + error.message);
    }
}
/*document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([13.0827, 80.2707], 13); // Default to Chennai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);

            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();
        },
        (error) => alert("Failed to get location: " + error.message)
    );
});*/

document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([13.0827, 80.2707], 13); // Default to Chennai

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);

            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();
        },
        (error) => alert("Failed to get location: " + error.message),
        {
            enableHighAccuracy: true,  // Use high accuracy (may consume more battery)
            timeout: 5000,  // Set timeout for getting the location
            maximumAge: 0  // Do not use cached location
        }
    );
});


async function getCoordinatesFromAddress(address) {
    
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        console.log("API Response:", data);
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } else {
            console.warn(`Could not find coordinates for address: ${address}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}















/*async function getCoordinatesFromAddress(address) {
    try {
        console.log(`📍 Fetching coordinates for: ${address}`);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`,
            {
                headers: { "User-Agent": "SewNear/1.0 (your@email.com)" }
            }
        );

        const data = await response.json();
        console.log("✅ API Response (Pretty Printed):", JSON.stringify(data, null, 2));

        if (Array.isArray(data) && data.length > 0) {
            const coordinates = { 
                lat: parseFloat(data[0].lat), 
                lng: parseFloat(data[0].lon) 
            };
            console.log(`✔️ Found coordinates:`, coordinates);
            return coordinates;
        } else {
            console.warn(`❌ No coordinates found for: ${address}`);
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching coordinates:", error);
        return null;
    }
}*/


function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/*async function displayTailors() {
    let tailorList = document.getElementById('tailorList');
    tailorList.innerHTML = " ";

    try {
        let response = await fetch('http://localhost:5000/tailor/getTailors');
        let tailors = await response.json();

        tailors.forEach(tailor => {
            console.log("Tailor ID:", tailor._id); // Debugging log

            let tailorDiv = document.createElement('div');
            tailorDiv.classList.add('tailor-box');
            tailorDiv.innerHTML = `
                <div class="tailor-content">
                    <div class="tailor-img">
                        <img src="${tailor.photoSrc}" alt="Tailor Photo" class="tailor-photo">
                        <h2>${tailor.name}</h2>
                    </div>
                    <div class="tailor-details">
                        <p><strong>Shop:</strong> ${tailor.shop}</p>
                        <p><strong>Contact:</strong> ${tailor.contact}</p>
                        <p><strong>Duty Hours:</strong> ${tailor.workingHours}</p>
                        <p><strong>Location:</strong> ${tailor.address}</p>
                        <p></p>
                    </div>
                    <div class="tailor-btn">
                        <button class="view-btn"  target='_blank'  onclick="viewDetails('${tailor._id}')">View Details</button>
                        
                    </div>
                </div>
            `;
            tailorList.appendChild(tailorDiv);
        });
    } catch (error) {
        alert("Failed to load tailors: " + error.message);
    }
}*/
async function displayTailors() {
    let tailorList = document.getElementById('tailorList');
    tailorList.innerHTML = "";

    try {
        // Get user's current location
        const userLocation = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }),
                () => reject(new Error('Failed to get user location'))
            );
        });

        let response = await fetch('http://localhost:5000/tailor/getTailors');
        let tailors = await response.json();

        let tailorDistances = [];

        // Calculate distance for each tailor
        for (let tailor of tailors) {
            const tailorCoordinates = await getCoordinatesFromAddress(tailor.address);

            if (tailorCoordinates) {
                const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    tailorCoordinates.lat, tailorCoordinates.lng
                );

                tailorDistances.push({ ...tailor, distance: distance.toFixed(2) });
            } else {
                tailorDistances.push({ ...tailor, distance: "N/A" });
            }
        }

        // Sort tailors by distance (smallest first)
        tailorDistances.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            for (let tailor of tailorDistances) {
                let tailorDiv = document.createElement('div');
                tailorDiv.classList.add('tailor-box');
            
                // Check if tailor is available
                let isAvailable = tailor.activeOrders < 7; 
                let statusText = isAvailable ? "✅ Available" : "❌ Unavailable";
                let statusColor = isAvailable ? "green" : "red";
                
                tailorDiv.innerHTML = `
 
                <div class="tailor-content ${!isAvailable ? 'unavailable' : ''}">
                        <div class="tailor-img">
                            <h2>${tailor.name}</h2>
                            <img src="${tailor.photoSrc}" alt="Tailor Photo" class="tailor-photo">
                    </div>
                        <div class="tailor-details">
                            <p><strong>Shop:</strong> ${tailor.shop}</p>
                            <p><strong>Contact:</strong> ${tailor.contact}</p>
                            <!--<p><strong>Duty Hours:</strong> ${tailor.workingHours}</p>-->
                            <p><strong>Location:</strong> ${tailor.address}</p>
                            
                            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
                            <div class="tailor-btn">
                             <button class="view-btn" target='_blank' 
                                onclick="viewDetails('${tailor._id}')" 
                                ${!isAvailable ? 'disabled' : ''}>
                                View
                             </button>
                             <p style="color:red;margin:0px">${tailor.name} has ${tailor.activeOrders} active orders.</p>
                            </div>
                    </div>
                    <div>
                          <p class="dist"><strong>${tailor.distance} km away!</strong></p>
                    </div>
                       
                </div>
              `;
            
                tailorList.appendChild(tailorDiv);
            }
            
    } catch (error) {
        alert("Failed to load tailors: " + error.message);
    }
}


async function deleteTailor(tailorId) {
    if (confirm("Are you sure you want to delete this tailor?")) {
        try {
            let response = await fetch(`http://localhost:5000/tailor/deleteTailor/${tailorId}`, { // ✅ Fixed URL
                method: 'DELETE'
            });

            let result = await response.json();
            alert(result.message);
            displayTailors();
        } catch (error) {
            alert("Error deleting tailor: " + error.message);
        }
    }
}

async function editTailor(tailor) {
    console.log("Editing Tailor:", tailor); // Debugging log

    if (!tailor || !tailor._id) {
        alert("Error: Tailor data is missing!");
        return;
    }

    document.getElementById('tailorName').value = tailor.name;
    document.getElementById('shopName').value = tailor.shop;
    document.getElementById('tailorAddress').value = tailor.address;
    document.getElementById('tailorContact').value = tailor.contact;
    document.getElementById('tailorWhatsApp').value = tailor.whatsapp;
    document.getElementById('tailorSpecialization').value = tailor.specialization;
    document.getElementById('tailorType').value = tailor.tailoringType;
    document.getElementById('fabricExpertise').value = tailor.fabric;
    document.getElementById('tailorPrice').value = tailor.price;
    document.getElementById('tailorHours').value = tailor.workingHours;
    document.getElementById('homePickup').value = tailor.pickup;
    document.getElementById('expressDelivery').value = tailor.express;
    document.getElementById('photoPreview').src = tailor.photoSrc || "defaulttailor.jpg";
  


    let saveBtn = document.getElementById('saveTailorBtn');
    saveBtn.setAttribute("onclick", `saveTailor('${tailor._id}')`);
    saveBtn.textContent = "Update Tailor";

    document.getElementById('formPopup').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block'; // Show overlay
}

async function viewDetails(tailorId) {
    try {
        let response = await fetch("http://localhost:5000/tailor/getTailors");
        let tailors = await response.json();
        let tailor = tailors.find(t => t._id === tailorId);

        if (tailor) {
            let photoSrc = tailor.photoSrc ? encodeURIComponent(tailor.photoSrc) : "images/defaulttailor.jpg";
            let url = `http://127.0.0.1:5000/viewdet.html?name=${encodeURIComponent(tailor.name)}&shop=${encodeURIComponent(tailor.shop)}&address=${encodeURIComponent(tailor.address)}&contact=${encodeURIComponent(tailor.contact)}&whatsapp=${encodeURIComponent(tailor.whatsapp)}&specialization=${encodeURIComponent(tailor.specialization)}&tailoringType=${encodeURIComponent(tailor.tailoringType)}&fabric=${encodeURIComponent(tailor.fabric)}&price=${encodeURIComponent(tailor.price)}&workingHours=${encodeURIComponent(tailor.workingHours)}&pickup=${encodeURIComponent(tailor.pickup)}&express=${encodeURIComponent(tailor.express)}&photo=${encodeURIComponent(tailor.photoSrc || 'defaulttailor.jpg')}`;


            window.location.href = url;
        } else {
            alert("Tailor details not found!");
        }
    } catch (error) {
        alert("Error fetching tailor details: " + error.message);
    }
}
document.getElementById("searchBar").addEventListener("input", function (event) {
    let searchTerm = event.target.value.toLowerCase(); // Get the search input
    let tailorList = document.querySelectorAll('.tailor-box'); // Select all tailor boxes

    tailorList.forEach(tailor => {
        // Extract data for filtering
        let tailorName = tailor.querySelector('h2').innerText.toLowerCase();
        let shopName = tailor.querySelector('.tailor-details p:nth-child(1)').innerText.toLowerCase(); // Shop name
        let address = tailor.querySelector('.tailor-details p:nth-child(3)').innerText.toLowerCase(); // Address

        // Check if search term matches any field
        let matchesSearch = 
            tailorName.includes(searchTerm) || 
            shopName.includes(searchTerm) || 
            address.includes(searchTerm);

        if (matchesSearch) {
            tailor.style.display = "block"; // Show matching tailor
        } else {
            tailor.style.display = "none"; // Hide non-matching tailor
        }
    });
});

const carousel = document.querySelector('.carousel');
const cards = document.querySelectorAll('.card');

let current = 1;

function updateCarousel() {
  cards.forEach((card, index) => {
    const position = (index - current + cards.length) % cards.length;

    if (position === 0) {
      card.className = 'card card-left';
    } else if (position === 1) {
      card.className = 'card card-center';
    } else {
      card.className = 'card card-right';
    }
  });
}

function moveToNext() {
  current = (current + 1) % cards.length; // Move to the next card
  updateCarousel();
}

// Automatically shift every 3 seconds
setInterval(moveToNext, 3000);

updateCarousel();
window.onload = displayTailors;


