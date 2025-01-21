require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

// MongoDB connection
const MONGO_URI="mongodb+srv://nikhilchary129:c1jxafBq5FBkLwbQ@cluster0.9cv4p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);


// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  menu: [ {
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    rating: { type: Number },
  }],
  reviews: { type: Number }, // Add review functionality if needed
  comments: [{ type: String }], // Add comment functionality if needed
   
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Middleware
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.json()); // Parses JSON bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  try {
    // Use aggregation to structure the output as needed
    const restaurantdata = await Restaurant.find();
    
    // Pass the filtered data to the view
    res.render('index', { restaurantdata });
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    res.status(500).send('Internal Server Error');
  } 
});

// Register route ("/register") - Serve the register.html page when accessed via GET
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));  // Sends the register.html file
});

// Register route ("/register") - Handle user registration via POST
app.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
 // console.log(req.body)
  try {
    const hashedPassword = password; // Replace with actual hashing logic
    const newUser = new User({ first_name, last_name, email, password: hashedPassword });
    await newUser.save();
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

let savedCart = []; 

app.get("/ratefood",async(req,res)=>{
  const restaurantdata = await Restaurant.find();
  //  console.log("/ratefood",savedCart)
  res.render('foodrate', { restaurantdata, savedCart });
})

app.get("/savedata", async (req, res) => {
  try {
    if (savedCart.length === 0) {
      return res.status(200).json({ success: true, message: "Cart is empty", cart: [] });
    }

    // Respond with the saved cart data
    res.status(200).json({ success: true, cart: savedCart });
  } catch (error) {
    console.error("Error retrieving cart:", error);

    // Handle any errors and send a response
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
app.post("/savedata", async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    savedCart = cart; // Save the cart data in memory
   // console.log("Cart saved:", savedCart);

    res.status(200).json({ success: true, message: "Order saved successfully" });
  } catch (error) {
    console.error("Error saving cart:", error);

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isMatch = password == user.password;

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/addRestaurant', async (req, res) => {
  res.render(path.join(__dirname, 'views', 'addrest.ejs'));
})
// Add a new restaurant route (for testing purposes)
app.post('/addRestaurant', async (req, res) => {
  const { name, image, menu, reviews, comments, rating } =  req.body;

  try {
    const newRestaurant = new Restaurant({ name, image, menu, reviews, comments, rating });
    await newRestaurant.save();
    res.status(201).json({ message: 'Restaurant added successfully', restaurant: newRestaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Get all restaurants route (for testing purposes)
app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});
app.get('/review/:id', async (req, res) => {
  const { id } = req.params;   try {
    const restaurantinfo = await Restaurant.findById(id);
    console.log(restaurantinfo);
    res.render('review', { restaurantinfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching restaurant info');
  }
});

app.post('/review/:id', async (req, res) => {
  const { rating, comment } = req.body; // Extract rating and comment from the form submission
  const { id } = req.params; // Restaurant ID from URL

  try {
      // Find the restaurant by ID
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
          return res.status(404).send('Restaurant not found');
      }

      // Ensure the rating is a valid number between 1 and 5
      const parsedRating = parseFloat(rating);
      console.log(rating,comment)
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
          return res.status(400).send('Invalid rating. Please submit a rating between 1 and 5.');
      }

      // If the restaurant already has a rating, calculate the new average rating
      if (restaurant.reviews !== undefined) {
          const currentAvgRating = restaurant.reviews;
          const newAvgRating = (currentAvgRating + parsedRating) / 2; // For simplicity, we take the average of the old and new ratings
          restaurant.reviews = newAvgRating.toFixed(1); // Update the average rating, rounded to 1 decimal place
      } else {
          // If no existing rating, just set the new rating
          restaurant.reviews = parsedRating.toFixed(1);
      }

      // Add the new comment
      restaurant.comments.push(comment);

      // Save changes to the restaurant
      await restaurant.save();

      // Redirect to the restaurant's review page
      res.redirect(`/review/${id}`);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error updating review and comment');
  }
});

app.get("/delivery",async(req,res)=>{
  res.render("delivery")
})
app.get("/payment",async(req,res)=>{
 // console.log("first")
  res.sendFile(path.join(__dirname, 'views', 'payment.html'));
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
