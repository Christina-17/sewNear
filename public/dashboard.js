const name = localStorage.getItem("loginname"); 
const mobile = localStorage.getItem("mobile"); 
const role = localStorage.getItem("role"); 




function showorder() {
    window.location.href = "http://127.0.0.1:5000/tailororders.html";
}


if (!name || !role) {
    window.location.href = "http://127.0.0.1:5000/index.html"; // Redirect if not logged in
} else {
    document.getElementById("username").innerText = name;
   

    if (role === "user") {
        // Show user section
        document.getElementById("userSection").style.display = "block";
        document.getElementById("tailorSection").style.display = "none";

            fetch(`http://localhost:5000/auth/users`)
.then(response => response.json())
.then(users => {
console.log("Fetched User Data:", users);

// Find the logged-in user's data
const user = users.find(user => user.name === name);

if (user) {
document.getElementById("mobile").innerText = user.mobile || "N/A";
} else {
document.getElementById("mobile").innerText = "N/A";
}
})
.catch(error => console.error("Error fetching user details:", error));

    } else if (role === "tailor") {
        // Show tailor section
        document.getElementById("userSection").style.display = "none";
        document.getElementById("tailorSection").style.display = "block";
         
        fetch(`http://localhost:5000/tailor/tailors?name=${encodeURIComponent(name)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("shop").innerText = data.shop || "N/A";
                document.getElementById("address").innerText = data.address || "N/A";
                document.getElementById("mobileTailor").innerText = data.contact || "N/A";
                document.getElementById("whatsapp").innerText = data.whatsapp || "N/A";
                document.getElementById("specialization").innerText = data.specialization || "N/A";
                //document.getElementById("tailorType").innerText = data.tailoringType || "N/A";
                document.getElementById("fabric").innerText = data.fabric || "N/A";
                document.getElementById("price").innerText = data.price || "N/A";
                document.getElementById("workingHours").innerText = data.workingHours || "N/A";
                document.getElementById("pickup").innerText = data.pickup || "N/A";
                document.getElementById("express").innerText = data.express || "N/A";
                document.getElementById("tailorPhoto").src = data.photoSrc || "images/defaulttailor.jpg";
            })
            .catch(error => console.error("Error fetching tailor details:", error));
    }
}


handletailordata();
// Function to show edit form with current values
function editTailorProfile() {
document.getElementById("editTailorForm").style.display = "block";

// Load existing values into form fields
document.getElementById("editShop").value = localStorage.getItem("tailorShop") || "Tailor Shop Name";
document.getElementById("editSpecialization").value = localStorage.getItem("tailorSpecialization") || "Custom Tailored Clothing";
document.getElementById("editFabric").value = localStorage.getItem("tailorFabric") || "Silk, Cotton, Linen";
document.getElementById("editAddress").value = localStorage.getItem("tailorAddress") || "123 Tailor Street, City";
document.getElementById("editMobileTailor").value = localStorage.getItem("tailorMobile") || "+91-XXXXXXXXXX";
document.getElementById("editWhatsApp").value = localStorage.getItem("tailorWhatsApp") || "+91-XXXXXXXXXX";
}

// Function to save updated details
function saveTailorDetails() {
const shopName = document.getElementById("editShop").value;
const specialization = document.getElementById("editSpecialization").value;
const fabric = document.getElementById("editFabric").value;
const address = document.getElementById("editAddress").value;
const mobile = document.getElementById("editMobileTailor").value;
const whatsapp = document.getElementById("editWhatsApp").value;

// Store updated values in localStorage (or send to backend)
localStorage.setItem("tailorShop", shopName);
localStorage.setItem("tailorSpecialization", specialization);
localStorage.setItem("tailorFabric", fabric);
localStorage.setItem("tailorAddress", address);
localStorage.setItem("tailorMobile", mobile);
localStorage.setItem("tailorWhatsApp", whatsapp);

// Update the display
document.getElementById("shop").innerText = shopName;
document.getElementById("specialization").innerText = specialization;
document.getElementById("fabric").innerText = fabric;
document.getElementById("address").innerText = address;
document.getElementById("mobileTailor").innerText = mobile;
document.getElementById("whatsapp").innerText = whatsapp;

// Hide form after saving
document.getElementById("editTailorForm").style.display = "none";

alert("Profile updated successfully!");
}
function handletailordata(){
document.addEventListener("DOMContentLoaded", async () => {
const mobile = localStorage.getItem("mobile");

if (!mobile) {
    console.error("❌ Mobile number not found in localStorage!");
    return;
}

let tailorId = localStorage.getItem("tailorId");

if (!tailorId) {
    try {
        const response = await fetch(`http://localhost:5000/tailor/getTailorId?mobile=${mobile}`);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        console.log("📌 Backend Response:", data);

        if (data.tailorId) {
            tailorId = Array.isArray(data.tailorId) ? data.tailorId[0] : data.tailorId;
            localStorage.setItem("tailorId", tailorId);
            console.log("✅ Stored Tailor ID:", tailorId);
        } else {
            console.error("❌ Tailor ID not found in response.");
            return;
        }
    } catch (error) {
        console.error("❌ Error fetching Tailor ID:", error);
        return;
    }
}

// ✅ Set Tailor ID in Hidden Field
document.getElementById("tailorIdField").value = tailorId;

// ✅ Fetch Products Once Tailor ID is Set
fetchProducts();
});

// ✅ Upload Product Form Submission
const uploadForm = document.getElementById("uploadForm");

if (uploadForm) {
uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    let tailorId = localStorage.getItem("tailorId");

    console.log("📌 Tailor ID before sending:", tailorId);

    if (!tailorId || tailorId === "undefined") {
        alert("❌ Tailor ID is missing. Please log in again.");
        return;
    }

    formData.delete("tailorId");
    formData.append("tailorId", tailorId.trim()); // Remove any extra spaces

    try {
        const response = await fetch("http://localhost:5000/tailor/add-product", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Product added successfully!");
            uploadForm.reset();

            // ✅ Fetch updated products after adding a new one
            fetchProducts();
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error("❌ Error uploading product:", error);
        alert("❌ Failed to upload product.");
    }
});
}

// ✅ Fetch Products
async function fetchProducts() {
try {
    const tailorId = localStorage.getItem("tailorId");
    if (!tailorId || tailorId === "undefined") {
        console.error("❌ Tailor ID is missing!");
        return;
    }

    const response = await fetch(`http://localhost:5000/tailor/get-products?tailorId=${tailorId}`);
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const data = await response.json();
    console.log("📌 Products received:", data);

    // ✅ Call function to display products
    displayProducts(data.products);

} catch (error) {
    console.error("❌ Error fetching products:", error);
}
}

function displayProducts(products) {
const productList = document.getElementById("productList");

if (!productList) {
    console.error("❌ Element #productList not found!");
    return;
}

productList.innerHTML = ""; // Clear previous content

if (products.length === 0) {
    productList.innerHTML = "<p>No products available.</p>";
    return;
}

// ✅ Create product elements dynamically
products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card"; // Add CSS class for styling

    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p>Price Range: ${product.priceRange}</p>
         <button class="delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
    `;

    productList.appendChild(productCard);
});

console.log("✅ Products displayed successfully.");
}

// ✅ Call fetchProducts when the page loads
//fetchProducts();
async function deleteProduct(productId) {
    const tailorId = localStorage.getItem("tailorId");

    if (!tailorId) {
        alert("❌ Tailor ID is missing. Please log in again.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/tailor/delete-product/${productId}?tailorId=${tailorId}`, {
            method: "DELETE",
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Product deleted successfully!");
            fetchProducts(); // Refresh products after deletion
        } else {
            alert(`❌ Error: ${result.error}`);
        }
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        alert("❌ Failed to delete product.");
    }
}
window.deleteProduct = deleteProduct;

}
// ✅ Logout Function
function logout() {
localStorage.clear();
alert("Logged out successfully!");
window.location.href = "http://127.0.0.1:5000/index.html";
}
