const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");




const productSchema = new mongoose.Schema({
    name: String,
    image: String, // URL of uploaded image
    priceRange: String,
});

// ✅ Define Tailor Schema
const tailorSchema = new mongoose.Schema({
    name: String,
    shop: String,
    address: String,
    contact: String,
    whatsapp: String,
    specialization: String,
    tailoringType: String,
    fabric: String,
    price: String,
    workingHours: String,
    pickup: String,
    express: String,
    photoSrc: String,
    products: [productSchema],
    lat: Number, 
    lng: Number
});
const orderSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    tailorName: String,
    tailorContact: String,
    shopName: String,
    status: { type: String, default: "Pending" }, // Default status as Pending
    createdAt: { type: Date, default: Date.now }
});
const OrderModel = mongoose.model("Order", orderSchema);
const Tailor = mongoose.model("Tailor", tailorSchema);




router.post('/add', async (req, res) => {
    try {
        const tailor = new Tailor(req.body);
        await tailor.save();
        res.status(201).json({ message: 'Tailor added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding tailor', error: error.message });
    }
});

router.post("/signin", async (req, res, next) => {
    const { name, contact } = req.body;

    if (!name || !contact) {
        return res.status(400).json({ message: "Both name and mobile number are required!" });
    }

    try {
        const tailor = await Tailor.findOne({ name, contact});

        if (!tailor) {
            return res.status(404).json({ message: "Tailor not found. Please check your credentials." });
        }

        res.status(200).json({ message: "Login successful!", tailor });
    } catch (error) {
        next(error);
    }
});

router.get("/tailors", async (req, res) => {
    const { name } = req.query;
    console.log("Received request for tailor:", name);

    if (!name) {
        return res.status(400).json({ error: "Tailor name is required" });
    }

    try {
        let tailor = await Tailor.findOne({ name: name });

        if (!tailor) {
            console.log("Tailor not found:", name);
            return res.status(404).json({ error: "Tailor not found" });
        }

        res.json(tailor);
    } catch (error) {
        console.error("Error fetching tailor:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get all tailors
router.get('/getTailors', async (req, res) => {
    try {
        const tailors = await Tailor.find();
        const tailorData = await Promise.all(tailors.map(async (tailor) => {
            // ✅ Count only active orders (Pending or In Progress)
            const activeOrders = await OrderModel.countDocuments({
                tailorName: tailor.name,
                status: { $in: ["Pending", "In Progress"] }
            });

            //console.log(`${tailor.name} has ${activeOrders} active orders.`); // Debugging

            return { ...tailor.toObject(), activeOrders };
        }));

        res.status(200).json(tailorData); // ✅ Send the correct tailorData
    }catch (error) {
        res.status(500).json({ message: 'Error fetching tailors', error: error.message });
    }
});

// Get a specific tailor by ID
router.get('/getTailor/:id', async (req, res) => {
    try {
        const tailor = await Tailor.findById(req.params.id);
        if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
        res.status(200).json(tailor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tailor', error: error.message });
    }
});

// Edit an existing tailor
router.put('/editTailor/:id', async (req, res) => {
    try {
        const updatedTailor = await Tailor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTailor) return res.status(404).json({ message: 'Tailor not found' });
        res.status(200).json({ message: 'Tailor updated successfully', tailor: updatedTailor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating tailor', error: error.message });
    }
});

// Delete a tailor
router.delete('/deleteTailor/:id', async (req, res) => {
    try {
        const deletedTailor = await Tailor.findByIdAndDelete(req.params.id);
        if (!deletedTailor) return res.status(404).json({ message: 'Tailor not found' });
        res.status(200).json({ message: 'Tailor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tailor', error: error.message });
    }
});
/*router.post("/book", async (req, res) => {
    const { customerName, customerPhone, tailorName, tailorContact } = req.body;

    if (!customerName || !customerPhone || !tailorContact) {
        return res.status(400).json({ message: "Missing booking details!" });
    }

    try {
        await client.messages.create({
            from: "whatsapp:+14155238886", // Twilio WhatsApp sandbox number
            to: `whatsapp:+91${tailorContact}`, // Tailor's WhatsApp
            body: `📢 *New Booking Alert!* 📢

    👗 *Tailor:* ${tailorName}
    👤 *Customer:* ${customerName}
    📞 *Contact:* ${customerPhone}
    📅 *Date:* ${new Date().toLocaleDateString()}
    ⏰ *Time:* ${new Date().toLocaleTimeString()}
    📩 Please confirm the booking.`
        });

        await client.messages.create({
            from: "whatsapp:+14155238886",
            to: `whatsapp:+91${customerPhone}`,
            body: `🎉 *Booking Confirmed!* 🎉\n\n👗 *Tailor:* ${tailorName}\n📍 *Contact:* ${tailorContact}\n📅 *Date:* ${new Date().toLocaleDateString()}\n⏰ *Time:* ${new Date().toLocaleTimeString()}\n✨ Happy stitching! ✨`
        });

        res.json({ message: "Booking confirmed! Tailor has been notified." });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
});
router.get("/myorders", async (req, res) => {
    const { username } = req.query;

    try {
        const orders = await Order.find({ username }).populate("tailorId");
        if (orders.length === 0) return res.status(404).json({ message: "No orders found for this user." });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});
*/
// Function to clean and ensure +91 prefix
/*const cleanNumber = (number) => {
    // Remove all non-digit characters
    let cleaned = number.replace(/\D/g, "");

    // Ensure exactly one +91 prefix
    if (cleaned.startsWith("91")) {
        return `+${cleaned}`;
    } else if (cleaned.startsWith("+91")) {
        return cleaned;
    } else {
        return `+91${cleaned}`;
    }
};*/

router.post("/book", async (req, res) => {
    const { customerName, customerPhone, tailorName, tailorContact, shopName,orderDetails,gender,clothingType} = req.body;
   
    
    try {
        const newOrder = new OrderModel({
            customerName,
            customerPhone,
            tailorName,
            tailorContact,
            shopName,
            orderDetails,
            gender,
            clothingType,
            status: "Pending"
        });

        await newOrder.save();
       // const formattedTailorNumber = cleanNumber(tailorContact);
       // const formattedCustomerNumber = cleanNumber(customerPhone);

        // ✅ WhatsApp Notifications (Tailor & Customer)
        /*const tailorMessage = `📌 New Order Alert!

👤 *Customer:* ${customerName}

📞 *Contact:* ${customerPhone}

⚧️ Gender:${gender}

📦 Product:${clothingType}

📅 *Date:* ${new Date().toLocaleDateString()}
⏰ *Time:* ${new Date().toLocaleTimeString()}
📌 *Status:* Pending`;

        const customerMessage = `🎉 Order Placed Successfully!
👗 *Tailor*: ${tailorName}

🏬 *Shop:* ${shopName}

📞 *Contact:* ${tailorContact}

📦 <strong>Product Name</strong>:${clothingType}

📅 *Date:* ${new Date().toLocaleDateString()}
⏰ *Time:* ${new Date().toLocaleTimeString()}
📌 *Status:* Pending`;

        await client.messages.create({
            from: "whatsapp:+14155238886",
            to: "whatsapp:+919841488706",
            body: tailorMessage
        });

        /*await client.messages.create({
            from: "whatsapp:+14155238886",
            to: `whatsapp:${formattedCustomerNumber}`,
            body: customerMessage
        });*/

        res.json({ message: "Order placed and notifications sent successfully!" });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Failed to place order" });
    }
});




router.get("/myorders", async (req, res) => {
    const { name } = req.query;

    try {
        console.log("Querying orders for:", name);

        // Case-insensitive search for customerName
        const orders = await OrderModel.find({ customerName: new RegExp(`^${name}$`, "i") }).populate("tailorId");

        if (orders.length === 0) {
            console.log("No orders found for:", name);
            return res.json({ message: "No orders found" });  // ✅ Only one response
        }

        return res.json(orders);  // ✅ Only one response

    } catch (error) {
        console.error("Error fetching orders:", error);
        if (!res.headersSent) {  
            return res.status(500).json({ message: "Error fetching orders" });
        }
    }
});

router.delete('/deleteorder/:id', async (req, res) => {
    const { id } = req.params;

    // ✅ Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Order ID format" });
    }

    try {
        const deletedOrder = await OrderModel.findByIdAndDelete(id);

        if (deletedOrder) {
            return res.json({ message: "Order deleted successfully!" });  
           
        }
        else{
            return res.status(404).json({ message: "Order not found" });
        }

    } catch (error) {
        console.error("Error deleting order:", error);
        return res.status(500).json({ message: "Failed to delete order" });
    }
});

router.get("/tailor-orders", async (req, res) => {
    const { tailorName } = req.query;

    if (!tailorName) {
        return res.status(400).json({ message: "Tailor name is required" });
    }

    try {
        // Fetch ALL orders assigned to this tailor (not just pending)
        const orders = await OrderModel.find({ tailorName });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching tailor orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

router.put("/update-order-status", async (req, res) => {
    const { orderId, status } = req.body;

    if (!orderId || !["Active", "Rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: `Order marked as ${status}`, order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
});
// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get("/getTailorId", async (req, res) => {
    const mobile = req.query.mobile;
    console.log(mobile);
    console.log("📥 Received request for Tailor ID with mobile:", mobile);

    if (!mobile) {
        console.log("❌ Missing mobile number in request");
        return res.status(400).json({ error: "Mobile number is required" });
    }

    try {
        const tailor = await Tailor.findOne({ contact: mobile });
        if (!tailor) {
            console.log("❌ No tailor found for this mobile:", mobile);
            return res.status(404).json({ error: "Tailor not found" });
        }
        console.log("📌 Full Tailor Data:", tailor);
        console.log("✅ Found Tailor:", tailor._id.toString());
        res.json({ tailorId: tailor._id.toString() });
    } catch (error) {
        console.error("❌ Error finding tailor:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// Get products for a tailor
router.post("/add-product", upload.single("image"), async (req, res) => {
    try {
        console.log("📥 Received Data:", req.body);
        console.log("📸 Uploaded File:", req.file);

        let { tailorId, name, priceRange } = req.body;

        // ✅ Ensure `tailorId` is a valid string (not an array)
        if (Array.isArray(tailorId)) {
            tailorId = tailorId.find(id => id.trim() !== ""); // Pick the first valid ID
        }

        // ✅ Check if tailorId is valid
        if (!mongoose.Types.ObjectId.isValid(tailorId)) {
            console.error("❌ Invalid Tailor ID:", tailorId);
            return res.status(400).json({ error: "Invalid tailorId format" });
        }

        const tailor = await Tailor.findById(tailorId);
        if (!tailor) {
            console.error("❌ Tailor not found for ID:", tailorId);
            return res.status(404).json({ error: "Tailor not found" });
        }

        // ✅ Ensure `products` array exists
        if (!Array.isArray(tailor.products)) {
            tailor.products = [];
        }

        const imagePath = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : "/uploads/default.jpg";

        const newProduct = { name, image: imagePath, priceRange };
        tailor.products.push(newProduct);

        await tailor.save();
        res.json({ message: "✅ Product added successfully", product: newProduct });
    } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).json({ error: "Error adding product" });
    }
});

router.get("/get-products", async (req, res) => {
    try {
        console.log("📥 Received request for tailor:", req.query.tailorId);

        const { tailorId } = req.query;
        if (!tailorId) {
            return res.status(400).json({ error: "Tailor ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(tailorId)) {
            return res.status(400).json({ error: "Invalid tailorId" });
        }

        const tailor = await Tailor.findById(tailorId);
        if (!tailor) {
            return res.status(404).json({ error: "Tailor not found" });
        }

        console.log("✅ Tailor found! Returning products:", tailor.products);
        res.json({ products: tailor.products });
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});
router.delete("/delete-product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const tailorId = req.query.tailorId; // Assuming tailorId is sent in the query

        if (!tailorId) {
            return res.status(400).json({ error: "Tailor ID is required" });
        }

        const tailor = await Tailor.findById(tailorId);
        if (!tailor) {
            return res.status(404).json({ error: "Tailor not found" });
        }

        // Filter out the product to delete
        tailor.products = tailor.products.filter(product => product._id.toString() !== productId);
        await tailor.save();

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;





