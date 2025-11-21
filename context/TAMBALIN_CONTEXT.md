# **Tambalin \- Application Context Document**

## **Overview**

Tambalin is a web-based motorcycle/vehicle repair shop finder application designed to help users quickly locate and contact nearby repair shops (bengkel) in Indonesia. The app prioritizes cost-effective API usage while providing emergency assistance for users who need immediate help with vehicle issues like flat tires or oil leaks.

## **User Roles**

The application supports two distinct user roles:

### **1\. User (Regular User)**

* Can browse and search repair shops  
* Can use emergency/quick access feature  
* Can view shop details and reviews  
* Must be logged in to write reviews  
* Does not need login to contact shops via WhatsApp

### **2\. Admin**

* Has access to admin dashboard  
* Can add new repair shops to the system  
* Can edit existing repair shop information  
* Can delete repair shops from the system  
* Full CRUD operations on repair shop data

## **Core Features**

### **1\. Home Page**

#### **Emergency/Quick Access Button**

* Users fill out a form with:  
  * Type of repair needed (flat tire, oil leak, etc.)  
  * Name  
  * Phone number  
  * Other relevant details  
* System shows 5-10 nearest repair shops using Google Maps Routes API for optimized road distance  
* User selects a shop and is redirected to WhatsApp with:  
  * Prefilled repair details  
  * Google Maps link to user's current location coordinates

#### **Explore Bengkel**

* Lists all repair shops sorted by straight-line distance (as-the-crow-flies) from user's current location  
* Uses direct coordinate-to-coordinate distance calculation (not Google Maps API) for cost efficiency  
* Provides quick browsing without expensive API calls

### **2\. Search Page**

* Search bar positioned at the top of home page  
* Search by shop name  
* Optional manual location filter (not mandatory)  
* Results page displays matching shops sorted by nearest location

### **3\. Bengkel (Shop) Page**

* Displays comprehensive shop information:  
  * Shop photos  
  * Shop description  
  * List of mechanics working at the shop  
  * User reviews and ratings  
* **Order button:** Opens detail form (same as emergency button), submits via WhatsApp  
* **Review feature:** Requires user login to write reviews (spam prevention)

### **4\. Authentication System**

#### **User Login/Register**

* **Purpose:** Only required for writing reviews to minimize spam  
* WhatsApp orders do not require authentication  
* Keeps user friction low for emergency situations

#### **Admin Authentication**

* **Purpose:** Access to admin dashboard  
* Required for all shop management operations

### **5\. Admin Dashboard**

Admin-only features for managing repair shop database:

* **Add:** Create new repair shop entries  
* **Edit:** Modify existing shop information  
* **Delete:** Remove shops from the system

## **Technical Architecture**

### **API Cost Optimization Strategy**

The application implements a two-tier approach to minimize Google Maps API costs:

#### **Regular Browsing (Explore Bengkel)**

* Uses straight-line distance calculation between coordinates  
* Mathematical formula: Distance between coordinate A and coordinate B  
* **Example scenario with 30 shops in database:**  
  * 30 simultaneous users browsing  
  * If using Google Maps API: 30 users × 30 shops \= 900 API calls  
  * Using coordinate calculations: 0 API calls for browsing

#### **Emergency Feature**

* Only uses Google Maps Routes API when users press emergency button  
* Shows maximum 5-10 shops per emergency request  
* Not all users will use emergency feature  
* **Cost calculation example:**  
  * 30 users open Tambalin  
  * Assume 80% actually need emergency help  
  * 30 users × 10 shops × 0.8 \= 240 API calls  
  * **Savings: \~73% reduction in API costs** (240 vs 900 calls)

### **Location Handling Strategy**

**User Location:**

* Obtained via browser's built-in geolocation API  
* No Google Places API needed  
* Direct coordinate capture (latitude, longitude)

**Distance Calculations:**

* **Browse mode:** Straight-line distance using coordinate math  
* **Emergency mode:** Road distance using Google Maps Routes API

**Sharing Location with Shops:**

* User coordinates converted to Google Maps URL  
* Format: `https://www.google.com/maps/search/?api=1&query=LAT,LONG`  
* Example: `https://www.google.com/maps/search/?api=1&query=41.40338%2C2.17403`  
* Sent via WhatsApp (no API cost)

### **Technology Stack**

* **Frontend Framework:** Next.js (implied from your background)  
* **Database:** Supabase  
* **Storage:** Supabase (for shop photos and assets)  
* **Hosting:** Vercel  
* **APIs:**  
  * Google Maps Routes API (minimal usage, emergency only)  
  * Browser Geolocation API (built-in)  
  * WhatsApp integration (via URL scheme)

## **Key Design Decisions**

### **1\. Cost-First Approach**

Prioritizes minimizing external API calls while maintaining functionality. Every feature is designed with API cost implications in mind.

### **2\. WhatsApp Integration**

Uses WhatsApp as the primary communication channel between users and repair shops. This eliminates need for:

* In-app messaging system  
* Complex notification infrastructure  
* Real-time communication backend

### **3\. Progressive Complexity**

* **Basic browsing:** No expensive API calls, fast loading  
* **Emergency requests:** Premium features activated only when truly needed

### **4\. Minimal Authentication**

* Only required where necessary (writing reviews)  
* Reduces friction for emergency situations  
* Prevents spam while maintaining accessibility

### **5\. Coordinate-Based Sorting**

* Mathematical distance calculation for regular browsing  
* Route-based calculation reserved for emergencies  
* Provides good-enough sorting for browsing at zero cost

## **User Flows**

### **Flow 1: Emergency Repair Request**

1. User opens Tambalin app  
2. Clicks "Emergency/Quick Access" button  
3. Fills out form with repair details and contact info  
4. System calculates optimal routes to 5-10 nearest shops  
5. User views sorted list of nearby shops  
6. User selects preferred shop  
7. System redirects to WhatsApp with prefilled message and location link  
8. User sends message to shop via WhatsApp

### **Flow 2: Browsing Shops**

1. User opens Tambalin app  
2. Views "Explore Bengkel" section  
3. Sees all shops sorted by straight-line distance  
4. Clicks on a shop to view details  
5. Reviews shop information, photos, mechanics, and reviews  
6. Optionally clicks "Order" to contact via WhatsApp

### **Flow 3: Searching for Specific Shop**

1. User enters shop name in search bar  
2. Optionally sets location filter  
3. Presses Enter  
4. Views search results sorted by distance  
5. Selects shop to view details

### **Flow 4: Writing a Review**

1. User views shop page  
2. Clicks on review section  
3. System prompts for login (if not authenticated)  
4. User logs in or registers  
5. User writes and submits review

### **Flow 5: Admin Management**

1. Admin logs into admin dashboard  
2. Views list of current repair shops  
3. Can perform actions:  
   * Add new shop with details, photos, mechanics list  
   * Edit existing shop information  
   * Delete shops from system

## **Data Models (Conceptual)**

### **User**

* User ID  
* Name  
* Email  
* Phone number  
* Role (User/Admin)

### **Repair Shop (Bengkel)**

* Shop ID  
* Shop name  
* Description  
* Coordinates (latitude, longitude)  
* Photos (stored in Supabase Storage)  
* Mechanics list  
* WhatsApp contact number

### **Review**

* Review ID  
* User ID (foreign key)  
* Shop ID (foreign key)  
* Rating  
* Comment text  
* Timestamp

### **Mechanic**

* Mechanic ID  
* Name  
* Shop ID (foreign key)  
* Specialty (optional)

## **Security Considerations**

* User authentication required only for review submission  
* Admin authentication required for all dashboard operations  
* Rate limiting should be implemented to prevent API abuse  
* Input validation on all forms (especially emergency form)  
* Supabase Row Level Security (RLS) policies for data access

## **Performance Considerations**

* Coordinate calculations performed client-side when possible  
* Google Maps Routes API calls minimized through strategic feature design  
* Shop list can be cached for faster browsing  
* Images optimized and served from Supabase Storage with CDN

## **Future Scalability**

The cost-optimization architecture allows the app to scale efficiently:

* Additional shops in database don't increase browsing costs  
* Emergency feature costs scale linearly with actual usage  
* WhatsApp integration eliminates need for complex backend messaging  
* Static browsing behavior allows for effective caching strategies
