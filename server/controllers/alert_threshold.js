import Alert_threshold from '../models/Alert_threshold.js';

export const add_alert_threshold = async (req, res) => {
    const currentUser = req.user;
    try {
        const { latitude, longitude, minimum_magnitude, location_name, alert_radius, enable_sms_alerts, enable_push_notifications } = req.body;

        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const alertThreshold = await Alert_threshold.create({
            user_id: currentUser._id,
            latitude,
            longitude,
            minimum_magnitude,
            location_name,
            alert_radius,
            enable_sms_alerts,
            enable_push_notifications
        });

        res.status(201).json({
            alertThreshold,
            success: "true",
            message: "Alert threshold created successfully"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


export const update_alert_threshold = async (req, res) => {
    const currentUser = req.user;
    try {
        const { latitude, longitude, minimum_magnitude, location_name, alert_radius, enable_sms_alerts, enable_push_notifications } = req.body;
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized' });
        }  
        const alertThreshold = await Alert_threshold.findOneAndUpdate(
            { user_id: currentUser._id },
            { latitude, longitude, minimum_magnitude, location_name, alert_radius, enable_sms_alerts, enable_push_notifications },
            { new: true }
        );
        if (!alertThreshold) {
            return res.status(404).json({ error: 'Alert threshold not found' });
        }
        res.status(200).json({
            alertThreshold,
            success: "true",
            message: "Alert threshold updated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const get_user_alert_threshold = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const alertThresholds = await Alert_threshold.find({ user_id: currentUser._id });
        res.status(200).json(alertThresholds);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}