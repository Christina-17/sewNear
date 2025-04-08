document.addEventListener("DOMContentLoaded", function() {
    const text = "Perfect Fit, Every Time! Book Your Tailor Online with Ease";
    let index = 0;
  
    function typeWriter() {
      if (index < text.length) {
        document.querySelector(".text").textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100); // Adjust speed (in milliseconds) as needed
      }
    }
  
    typeWriter();
  });
  document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("loginButton");
    const name= localStorage.getItem("loginname");
    const nav3=document.getElementById("nav3");
    if (name) {
        loginButton.innerText = `Hello, ${name}!\nReady to stitch up something amazing today?`;
        loginButton.style.width="auto";
        loginButton.style.fontSize="25px";
        loginButton.style.marginTop="40px";
        nav3.textContent="MyOrders";
        nav3.onclick = () => window.location.href = "file:///C:/Mini_Project/auth-app/public/dashboard.html";
        loginButton.onclick = null; // Disable clicking
    }
});

function redirectToLogin() {
    window.location.href = "homepage/signin.html"; // Adjust the path if needed
}
  
 

  