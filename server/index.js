import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from './routes/auth.js';
import earthquakeRoutes from './routes/earthquake_data.js';
import simulatedEarthquakeRoutes from './routes/simulated_earthquake.js';
import alertThresholdRoutes from './routes/alert_threshold.js';
import connectDbB from "./config/db.js";
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();
import axios from 'axios';

const app = express();

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in environment variables');
    process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in environment variables');
    process.exit(1);
}

connectDbB().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/auth", authRoutes);
app.use("/earthquake", earthquakeRoutes);
app.use("/simulated-earthquake", simulatedEarthquakeRoutes);
app.use("/alert-threshold", alertThresholdRoutes);

app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.get('/', (req, res) => {
    res.json({"msg": "Server is running"});
});


app.post('/send-sms', async (req, res) => {
    try {
        const { phoneNumbers, text } = req.body;
        const smsApiUrl = 'https://api.sms-gate.app/3rdparty/v1/message';
        const smsApiUsername = process.env.SMS_API_USERNAME;
        const smsApiPassword = process.env.SMS_API_PASSWORD;

        await axios.post(smsApiUrl, {
            textMessage: { text },
            phoneNumbers,
            "simNumber": 1,
        }, {
            auth: {
                username: smsApiUsername,
                password: smsApiPassword
            }
        });

        res.status(200).json({ success: true, message: 'SMS sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send SMS', error: error.message });
    }
});

/* get request to the pollination api with this query:
https://text.pollinations.ai/analyze the area_type of the given location of earthquakes with coordinates below,with x kilometer away from with direction like identify what type of location like "88 km NE of Dicabisagan, Philippines"   and return me the earthquake safety guide in the json format like below based on the earthquake proximity for example if near in coastal then evauate to the high lands. You should give safety guides based on proximity or related to it. If its not coastal, then don't suggest about the guideline like in coastal.
given:
{
place: "3 km N of Union, Philippines",
coordinates: ["9.800404264254931", "126.09921400732965"]
}
output (json only) formmated in this format only  nothing more:
{
place: "Mauban Quezon",
coordinates: ["14.267876275020605", "121.73146637692165"],
safety_guide: [
"Move to higher ground immediately to avoid potential tsunamis or storm surges. Keep emergency kits ready and stay updated with local advisories.",
"Evacuate to elevated areas and avoid low-lying zones prone to flooding. Ensure a safe route inland and inform family members of your location.",
...}
}*/

app.get('/pollination-safety-guide', async (req, res) => {
    try {
                const { place, coordinates } = req.query;
                const prompt = `analyze the area_type of the given location of earthquakes with coordinates below,with x kilometer away from with direction like identify what type of location like "88 km NE of Dicabisagan, Philippines"   and return me the earthquake safety guide in the json format like below based on the earthquake proximity for example if near in coastal then evauate to the high lands. In generating safety guides follow the RULES  below.

                RULES:
                -Analyze the given location and coordinates to determine the area type (coastal, mountainous, urban, rural, etc.).
                - Safety guidelines MUST be relevant to the identified area type only
                - If coastal: include tsunami/storm surge evacuation procedures
                - If mountainous: include landslide warnings and stable ground identification
                - If urban: include building safety, structural hazards, and evacuation routes
                - If rural: include open area safety and distance from structures
                - Do NOT include coastal guidelines for non-coastal areas
                - Do NOT include mountain-specific advice for flat areas
                - Each guideline should be clear, concise, and immediately actionable.
                - Don't do "if its coastal then do this else do that"
                -It mustn't be null/empty
                -Safety guidelines should be atleast three but you can add more if you like, and don't append two sentences or more in one item.


                given:
                {
                place: "${place}",
                coordinates: ["${coordinates[0]}", "${coordinates[1]}"]
                }   
                output (json only) formmated in this format only  nothing more, do that in one line without "\\n" or new line, safety guide is array with multiple items:
                {
                place: "Mauban Quezon",
                coordinates: ["14.267876275020605", "121.73146637692165"],
                area_type: "coastal",
                safety_guide: [
                    "Move to higher ground immediately to avoid potential tsunamis or storm surges. Keep emergency kits ready and stay updated with local advisories.",

                    "Evacuate to elevated areas and avoid low-lying zones prone to flooding. Ensure a safe route inland and inform family members of your location.",
                    ...
                ]}
                }`;       
         
                const pollinationApiUrl = 'https://text.pollinations.ai/'+prompt;

       const response = await axios.get(pollinationApiUrl, {
           place,
           coordinates
       });

       console.log(response.data);

       const safetyGuide = response.data.safety_guide;

       res.status(200).json({
           place,
           coordinates,
           safety_guide: safetyGuide
       });
   } catch (error) {
       console.error('Error fetching pollination safety guide:', error);
       res.status(500).json({ error: 'Failed to fetch safety guide' + error.message });
   }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});